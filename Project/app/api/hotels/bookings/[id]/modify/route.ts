/**
 * Booking Modification API Endpoint
 *
 * POST /api/hotels/bookings/[id]/modify
 *
 * Request modification of an existing booking.
 * Protected endpoint - requires Clerk authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";
import { calculateNights, validateDateRange } from "@/lib/hotel/utils";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to modify bookings",
        },
        { status: 401 },
      );
    }

    const { id: bookingId } = params;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const {
      modification_type, // 'dates', 'room', 'guests'
      new_check_in_date,
      new_check_out_date,
      new_room_id,
      new_guest_count,
      reason,
    } = body;

    // Get existing booking
    const { data: booking, error: bookingError } = await supabaseServerClient
      .from("hotel_bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 },
      );
    }

    // Check if booking is modifiable
    if (!["pending", "confirmed"].includes(booking.status)) {
      return NextResponse.json(
        {
          error: "Booking cannot be modified",
          message: `Bookings with status '${booking.status}' cannot be modified`,
        },
        { status: 400 },
      );
    }

    // Check if check-in date has passed
    if (new Date(booking.check_in_date) < new Date()) {
      return NextResponse.json(
        {
          error: "Cannot modify past bookings",
          message: "Booking check-in date has already passed",
        },
        { status: 400 },
      );
    }

    let oldValues: any = {};
    let newValues: any = {};
    let priceDifference = 0;

    // Handle different modification types
    if (modification_type === "dates") {
      if (!new_check_in_date || !new_check_out_date) {
        return NextResponse.json(
          {
            error: "Missing dates",
            message:
              "new_check_in_date and new_check_out_date are required for date modifications",
          },
          { status: 400 },
        );
      }

      if (!validateDateRange(new_check_in_date, new_check_out_date)) {
        return NextResponse.json(
          {
            error: "Invalid dates",
            message: "New check-out date must be after check-in date",
          },
          { status: 400 },
        );
      }

      const newNights = calculateNights(new_check_in_date, new_check_out_date);

      // Check availability for new dates
      const { data: newRates } = await supabaseServerClient
        .from("hotel_rates")
        .select("*")
        .eq("room_id", booking.room_id)
        .eq("partner_id", booking.partner_id)
        .gte("date", new_check_in_date)
        .lt("date", new_check_out_date);

      if (!newRates || newRates.length !== newNights) {
        return NextResponse.json(
          {
            error: "Rates not available",
            message: "Rates not available for all nights in the new date range",
          },
          { status: 400 },
        );
      }

      const unavailable = newRates.filter((r) => r.available_rooms <= 0);
      if (unavailable.length > 0) {
        return NextResponse.json(
          {
            error: "Room not available",
            message: `No rooms available on: ${unavailable.map((r) => r.date).join(", ")}`,
          },
          { status: 400 },
        );
      }

      const newTotalCents = newRates.reduce((sum, r) => sum + r.price_cents, 0);
      priceDifference = newTotalCents - booking.total_cents;

      oldValues = {
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        nights_count: booking.nights_count,
        total_cents: booking.total_cents,
      };

      newValues = {
        check_in_date: new_check_in_date,
        check_out_date: new_check_out_date,
        nights_count: newNights,
        total_cents: newTotalCents,
      };
    } else if (modification_type === "room") {
      if (!new_room_id) {
        return NextResponse.json(
          {
            error: "Missing room",
            message: "new_room_id is required for room modifications",
          },
          { status: 400 },
        );
      }

      // Check new room availability
      const { data: newRates } = await supabaseServerClient
        .from("hotel_rates")
        .select("*")
        .eq("room_id", new_room_id)
        .eq("partner_id", booking.partner_id)
        .gte("date", booking.check_in_date)
        .lt("date", booking.check_out_date);

      if (!newRates || newRates.length !== booking.nights_count) {
        return NextResponse.json(
          {
            error: "Rates not available",
            message: "New room not available for booking dates",
          },
          { status: 400 },
        );
      }

      const newTotalCents = newRates.reduce((sum, r) => sum + r.price_cents, 0);
      priceDifference = newTotalCents - booking.total_cents;

      oldValues = {
        room_id: booking.room_id,
        total_cents: booking.total_cents,
      };

      newValues = {
        room_id: new_room_id,
        total_cents: newTotalCents,
      };
    } else if (modification_type === "guests") {
      if (!new_guest_count) {
        return NextResponse.json(
          {
            error: "Missing guest count",
            message: "new_guest_count is required for guest modifications",
          },
          { status: 400 },
        );
      }

      // Verify room capacity
      const { data: room } = await supabaseServerClient
        .from("hotel_rooms")
        .select("capacity, max_adults, max_children")
        .eq("id", booking.room_id)
        .single();

      if (room) {
        const totalGuests =
          (new_guest_count.adults || 0) + (new_guest_count.children || 0);
        if (totalGuests > room.capacity) {
          return NextResponse.json(
            {
              error: "Capacity exceeded",
              message: `Room capacity is ${room.capacity} guests`,
            },
            { status: 400 },
          );
        }
      }

      oldValues = {
        guest_count: booking.guest_count,
      };

      newValues = {
        guest_count: new_guest_count,
      };

      priceDifference = 0; // Guest count changes typically don't affect price
    } else {
      return NextResponse.json(
        {
          error: "Invalid modification type",
          message: "modification_type must be dates, room, or guests",
        },
        { status: 400 },
      );
    }

    // Create modification record
    const { data: modification, error: modError } = await supabaseServerClient
      .from("hotel_booking_modifications")
      .insert([
        {
          booking_id: bookingId,
          user_id: user.id,
          modification_type,
          old_values: oldValues,
          new_values: newValues,
          price_difference_cents: priceDifference,
          additional_charge_cents: priceDifference > 0 ? priceDifference : 0,
          refund_amount_cents:
            priceDifference < 0 ? Math.abs(priceDifference) : 0,
          status: "pending",
          reason: reason || null,
        },
      ])
      .select()
      .single();

    if (modError) {
      console.error("Modification creation error:", modError);
      return NextResponse.json(
        {
          error: "Failed to create modification request",
          message: modError.message,
        },
        { status: 500 },
      );
    }

    // Update booking status to 'modified' (pending approval)
    await supabaseServerClient
      .from("hotel_bookings")
      .update({
        is_modified: true,
        modification_count: (booking.modification_count || 0) + 1,
        modified_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json(
      {
        success: true,
        data: {
          modification_id: modification.id,
          booking_id: bookingId,
          modification_type,
          price_difference_cents: priceDifference,
          status: "pending",
          message:
            priceDifference > 0
              ? `Modification requested. Additional charge: $${(priceDifference / 100).toFixed(2)}`
              : priceDifference < 0
                ? `Modification requested. Refund: $${(Math.abs(priceDifference) / 100).toFixed(2)}`
                : "Modification requested. No price change.",
        },
        message:
          "Modification request submitted successfully. You will be notified once processed.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking modification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
