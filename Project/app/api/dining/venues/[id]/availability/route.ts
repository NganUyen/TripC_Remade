// API Route: GET /api/dining/venues/[id]/availability - Check availability for a venue

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/dining/supabaseServerClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const guestCount = parseInt(searchParams.get("guest_count") || "2");

    if (!date || !time) {
      return NextResponse.json(
        {
          success: false,
          error: "Date and time are required",
        },
        { status: 400 },
      );
    }

    // Check if venue exists and is active
    const { data: venue, error: venueError } = await supabaseServerClient
      .from("dining_venues")
      .select("id, name, capacity, operating_hours")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (venueError || !venue) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue not found or inactive",
        },
        { status: 404 },
      );
    }

    // Check if date is blocked
    const { data: blockedDates } = await supabaseServerClient
      .from("dining_blocked_dates")
      .select("*")
      .eq("venue_id", id)
      .lte("start_date", date)
      .gte("end_date", date);

    if (blockedDates && blockedDates.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: "Venue is closed on this date",
        },
      });
    }

    // Check existing reservations
    const { data: existingReservations } = await supabaseServerClient
      .from("dining_reservations")
      .select("guest_count")
      .eq("venue_id", id)
      .eq("reservation_date", date)
      .eq("reservation_time", time)
      .in("status", ["pending", "confirmed", "seated"]);

    const currentGuests =
      existingReservations?.reduce((sum, r) => sum + r.guest_count, 0) || 0;
    const availableCapacity = venue.capacity - currentGuests;
    const isAvailable = availableCapacity >= guestCount;

    // Get available time slots for the date
    const dayOfWeek = new Date(date).getDay();
    const { data: timeSlots } = await supabaseServerClient
      .from("dining_time_slots")
      .select("*")
      .eq("venue_id", id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    return NextResponse.json({
      success: true,
      data: {
        available: isAvailable,
        capacity: venue.capacity,
        available_capacity: availableCapacity,
        current_reservations: currentGuests,
        time_slots: timeSlots || [],
        reason: !isAvailable
          ? "Insufficient capacity for the requested party size"
          : undefined,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/dining/venues/[id]/availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check availability",
      },
      { status: 500 },
    );
  }
}
