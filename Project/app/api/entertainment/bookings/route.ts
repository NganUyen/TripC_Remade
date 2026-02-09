/**
 * Entertainment Bookings API
 *
 * POST /api/entertainment/bookings - Create new booking
 * GET /api/entertainment/bookings - Get user's bookings
 *
 * Handles complete booking flow including:
 * - Availability checking
 * - Price calculation
 * - Booking creation
 * - Confirmation code generation
 * - Ticket generation
 * - Email confirmation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { unifiedEmailService } from "@/lib/email/unified-email-service";

export const dynamic = "force-dynamic";

// Generate unique confirmation code (format: ENT-ABC123)
function generateConfirmationCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "ENT-";
  // 3 letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // 3 numbers
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

// Check if confirmation code is unique
async function getUniqueConfirmationCode(supabase: any): Promise<string> {
  let code = generateConfirmationCode();
  let attempts = 0;

  while (attempts < 10) {
    const { data } = await supabase
      .from("entertainment_bookings")
      .select("id")
      .eq("booking_reference", code)
      .single();

    if (!data) {
      return code; // Code is unique
    }

    code = generateConfirmationCode();
    attempts++;
  }

  throw new Error("Failed to generate unique confirmation code");
}

/**
 * POST /api/entertainment/bookings
 * Create new entertainment booking
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check (optional for guest bookings)
    const user = await currentUser();
    const userId = user?.id || "GUEST";

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    const {
      item_id,
      session_id,
      ticket_type_id,
      quantity,
      customer,
      special_requests = "",
      add_ons = [],
    } = body;

    console.log("[Booking Request]", {
      item_id,
      ticket_type_id,
      quantity,
      customer,
    });

    // Validation
    if (!item_id || !ticket_type_id || !quantity || !customer) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Missing required fields",
          },
        },
        { status: 400 },
      );
    }

    if (!customer.name || !customer.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CUSTOMER",
            message: "Customer name and email are required",
          },
        },
        { status: 400 },
      );
    }

    // Get item details
    const { data: item, error: itemError } = await supabase
      .from("entertainment_items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      console.error("Item fetch error:", itemError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ITEM_NOT_FOUND",
            message: "Entertainment item not found",
          },
        },
        { status: 404 },
      );
    }

    // Get ticket type details
    const { data: ticketType, error: ticketError } = await supabase
      .from("entertainment_ticket_types")
      .select("*")
      .eq("id", ticket_type_id)
      .single();

    if (ticketError || !ticketType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TICKET_TYPE_NOT_FOUND",
            message: "Ticket type not found",
          },
        },
        { status: 404 },
      );
    }

    // Check availability if session is specified
    if (session_id) {
      const { data: session, error: sessionError } = await supabase
        .from("entertainment_sessions")
        .select("*")
        .eq("id", session_id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SESSION_NOT_FOUND",
              message: "Session not found",
            },
          },
          { status: 404 },
        );
      }

      const availableSpots = session.total_spots - session.booked_count;
      if (availableSpots < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_AVAILABILITY",
              message: `Only ${availableSpots} spots remaining`,
            },
          },
          { status: 409 },
        );
      }
    }

    // Calculate pricing
    const ticketPrice = ticketType.price * quantity;
    const addOnsTotal = add_ons.reduce((sum: number, addonId: string) => {
      const addon = item.addOns?.find((a: any) => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);

    const subtotal = ticketPrice + addOnsTotal;
    const serviceFeeRate = 0.075; // 7.5% service fee
    const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
    const totalAmount = subtotal + serviceFee;

    // Generate confirmation code
    const confirmationCode = await getUniqueConfirmationCode(supabase);

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("entertainment_bookings")
      .insert({
        booking_reference: confirmationCode,
        user_id: userId,
        item_id,
        session_id: session_id || null,
        organizer_id: item.organizer_id || null,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        total_quantity: quantity,
        total_amount: totalAmount,
        currency: "USD",
        payment_status: "pending",
        payment_method: "credit_card",
        booking_status: "confirmed",
        notes: special_requests || null,
        metadata: {
          ticket_price: ticketPrice,
          service_fee: serviceFee,
          add_ons: add_ons,
        },
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      throw bookingError;
    }

    console.log(
      `[Entertainment Booking Created] Confirmation: ${confirmationCode}, User: ${userId}, Item: ${item_id}`,
    );

    // Generate tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `${confirmationCode}-T${String(i + 1).padStart(2, "0")}`;
      const qrData = `${ticketNumber}:${booking.id}:${item_id}`;

      const { data: ticket, error: ticketError } = await supabase
        .from("entertainment_tickets")
        .insert({
          ticket_number: ticketNumber,
          booking_id: booking.id,
          ticket_type_id,
          qr_code_data: qrData,
          status: "valid",
        })
        .select()
        .single();

      if (!ticketError && ticket) {
        tickets.push(ticket);
      }
    }

    // Update session booked count
    if (session_id) {
      await supabase
        .from("entertainment_sessions")
        .update({
          booked_count: supabase.rpc("increment", { x: quantity }),
        })
        .eq("id", session_id);
    }

    // Update item booking count
    await supabase
      .from("entertainment_items")
      .update({
        total_bookings: (item.total_bookings || 0) + quantity,
      })
      .eq("id", item_id);

    // Get session details for email
    let sessionDetails = null;
    if (session_id) {
      const { data: session } = await supabase
        .from("entertainment_sessions")
        .select("*")
        .eq("id", session_id)
        .single();
      sessionDetails = session;
    }

    // Send confirmation email (async, don't block response)
    unifiedEmailService
      .sendBookingEmail({
        category: "entertainment",
        guest_name: customer.name,
        guest_email: customer.email,
        booking_code: confirmationCode,
        title: item.title,
        description: `${quantity}x ${ticketType.name}`,
        start_date:
          sessionDetails?.date || new Date().toISOString().split("T")[0],
        total_amount: totalAmount,
        currency: "USD",
        metadata: {
          item_id,
          ticket_type: ticketType.name,
          quantity,
          location: item.location,
          tickets: tickets.map((t) => t.ticket_number),
        },
      })
      .catch((error) => {
        console.error("[Email Send Failed]", error);
      });



    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        booking_id: booking.id,
        confirmation_code: confirmationCode,
        status: "confirmed",
        ticket_count: quantity,
        tickets: tickets.map((t) => ({
          ticket_number: t.ticket_number,
          qr_code: t.qr_code_data,
        })),
        total_amount: totalAmount,
        currency: "USD",
        breakdown: {
          tickets: ticketPrice,
          add_ons: addOnsTotal,
          service_fee: serviceFee,
        },
      },
    });
  } catch (error) {
    console.error("Entertainment Booking API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BOOKING_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to create booking",
        },
      },
      { status: 500 },
    );
  }
}
/**
 * GET /api/entertainment/bookings
 * Get user's bookings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("entertainment_bookings")
      .select(
        `
        *,
        item:entertainment_items(id, title, images, location),
        organizer:entertainment_organizers(id, name)
      `,
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if specified
    if (status !== "all") {
      query = query.eq("booking_status", status);
    }

    const { data: bookings, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: bookings || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Booking GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
