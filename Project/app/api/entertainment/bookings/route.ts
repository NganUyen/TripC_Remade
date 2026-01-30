/**
 * Bookings API - Create and manage bookings
 *
 * GET /api/entertainment/bookings - Get user's bookings
 * POST /api/entertainment/bookings - Create new booking (checkout)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/entertainment/bookings
 * Get user's booking history
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status"); // confirmed, cancelled, completed
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("entertainment_bookings")
      .select(
        `
        *,
        item:entertainment_items(*),
        session:entertainment_sessions(*),
        organizer:entertainment_organizers(*)
      `,
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("booking_status", status);
    }

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error("Bookings query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      bookings: bookings || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error("Bookings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/entertainment/bookings
 * Create new booking from cart (checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_email) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, customer_email" },
        { status: 400 },
      );
    }

    // Get user's active cart
    const { data: cart } = await supabase
      .from("entertainment_cart")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found or empty" },
        { status: 400 },
      );
    }

    // Get all cart items
    const { data: cartItems } = await supabase
      .from("entertainment_cart_items")
      .select(
        `
        *,
        item:entertainment_items(*),
        session:entertainment_sessions(*),
        ticket_type:entertainment_ticket_types(*)
      `,
      )
      .eq("cart_id", cart.id);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Verify availability for all items
    for (const cartItem of cartItems) {
      if (
        cartItem.session &&
        cartItem.session.available_count < cartItem.quantity
      ) {
        return NextResponse.json(
          {
            error: `Insufficient availability for ${cartItem.item.title}. Only ${cartItem.session.available_count} left.`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Generate booking reference
    const bookingRef = `ENT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create bookings (one per item in cart)
    const bookings = [];

    for (const cartItem of cartItems) {
      const { data: booking, error: bookingError } = await supabase
        .from("entertainment_bookings")
        .insert([
          {
            booking_reference: `${bookingRef}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
            user_id: userId,
            item_id: cartItem.item_id,
            session_id: cartItem.session_id,
            organizer_id: cartItem.item.organizer_id,
            customer_name: body.customer_name,
            customer_email: body.customer_email,
            customer_phone: body.customer_phone || null,
            total_quantity: cartItem.quantity,
            total_amount: cartItem.total_price,
            currency: cartItem.currency,
            payment_status: "pending", // Would be 'paid' after payment processing
            payment_method: body.payment_method || "credit_card",
            booking_status: "confirmed",
            notes: body.notes || null,
          },
        ])
        .select()
        .single();

      if (bookingError) {
        console.error("Booking creation error:", bookingError);
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      bookings.push(booking);

      // Update session booked count
      if (cartItem.session) {
        await supabase
          .from("entertainment_sessions")
          .update({
            booked_count: cartItem.session.booked_count + cartItem.quantity,
          })
          .eq("id", cartItem.session_id);
      }

      // Update item booking count
      await supabase
        .from("entertainment_items")
        .update({
          total_bookings:
            (cartItem.item.total_bookings || 0) + cartItem.quantity,
        })
        .eq("id", cartItem.item_id);

      // Generate tickets for this booking
      for (let i = 0; i < cartItem.quantity; i++) {
        const ticketNumber = `${booking.booking_reference}-T${i + 1}`;
        const qrData = `${ticketNumber}:${booking.id}:${cartItem.item_id}`;

        await supabase.from("entertainment_tickets").insert([
          {
            ticket_number: ticketNumber,
            booking_id: booking.id,
            ticket_type_id: cartItem.ticket_type_id,
            qr_code_data: qrData,
            status: "valid",
          },
        ]);
      }
    }

    // Clear cart
    await supabase
      .from("entertainment_cart_items")
      .delete()
      .eq("cart_id", cart.id);

    await supabase
      .from("entertainment_cart")
      .update({ status: "checked_out" })
      .eq("id", cart.id);

    // Create notification
    await supabase.from("entertainment_notifications").insert([
      {
        user_id: userId,
        type: "booking_confirmed",
        title: "Booking Confirmed!",
        message: `Your booking ${bookingRef} has been confirmed. Check your email for details.`,
        item_id: bookings[0].item_id,
        booking_id: bookings[0].id,
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        bookings,
        message: "Booking(s) created successfully",
        booking_reference: bookingRef,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Booking POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
