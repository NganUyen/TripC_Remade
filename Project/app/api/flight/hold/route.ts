/**
 * Hold Booking API (Soft Booking / Price Lock)
 * POST /api/flight/hold
 *
 * Creates a hold booking without payment for a limited time
 * Allows users to reserve seats before committing to purchase
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/flight/clerkAuth";

interface HoldBookingRequest {
  offer_id: string;
  passengers: Array<{
    first_name: string;
    last_name: string;
    dob: string;
    document_type?: string;
    document_number?: string;
    nationality?: string;
  }>;
  contact_info: {
    email: string;
    phone: string;
  };
  hold_duration_hours?: number; // Default 24 hours
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId, error: authError } = await verifyClerkAuth();
    if (authError || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: HoldBookingRequest = await request.json();
    const {
      offer_id,
      passengers,
      contact_info,
      hold_duration_hours = 24,
    } = body;

    // Validate input
    if (
      !offer_id ||
      !passengers ||
      passengers.length === 0 ||
      !contact_info?.email
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: offer_id, passengers, contact_info",
        },
        { status: 400 },
      );
    }

    const supabase = supabaseServerClient;

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from("flight_offers")
      .select("*, flight:flights(*)")
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Check seat availability
    const requiredSeats = passengers.length;
    if (offer.seats_available < requiredSeats) {
      return NextResponse.json(
        {
          error: "Insufficient seats available",
          available: offer.seats_available,
          requested: requiredSeats,
        },
        { status: 400 },
      );
    }

    // Calculate hold expiry
    const hold_until = new Date();
    hold_until.setHours(hold_until.getHours() + hold_duration_hours);

    // Calculate payment deadline (1 hour before hold expiry)
    const payment_deadline = new Date(hold_until);
    payment_deadline.setHours(payment_deadline.getHours() - 1);

    // Create hold booking
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .insert({
        user_id: userId,
        offer_id: offer.id,
        flight_id: offer.flight_id,
        passengers,
        contact_info,
        lead_passenger_email: contact_info.email,
        lead_passenger_phone: contact_info.phone,
        price_paid: offer.total_price,
        base_fare: offer.base_fare,
        taxes_fees: offer.taxes_fees,
        currency: offer.currency,
        status: "PENDING",
        booking_type: "HOLD",
        is_hold_booking: true,
        hold_until,
        hold_payment_deadline: payment_deadline,
        payment_status: "PENDING",
        ticketing_status: "PENDING",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create hold booking" },
        { status: 500 },
      );
    }

    // Decrement available seats
    await supabase
      .from("flight_offers")
      .update({
        seats_available: offer.seats_available - requiredSeats,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer.id);

    // Schedule expiry job (in production, use a job queue)
    // For MVP, we'll handle this in a cron job

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          pnr: booking.pnr,
          status: booking.status,
          booking_type: booking.booking_type,
          hold_until: booking.hold_until,
          payment_deadline: booking.hold_payment_deadline,
          total_price: booking.price_paid,
          currency: booking.currency,
        },
        message: `Booking held until ${new Date(hold_until).toLocaleString()}. Please complete payment before ${new Date(payment_deadline).toLocaleString()}.`,
        payment_url: `/checkout/${booking.id}`, // Redirect to checkout page
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Hold booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
