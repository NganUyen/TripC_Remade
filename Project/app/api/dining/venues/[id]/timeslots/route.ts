// API Route: GET /api/dining/venues/[id]/timeslots - Get available time slots for a venue

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

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 },
      );
    }

    const dayOfWeek = new Date(date).getDay();

    // Get time slots for the day
    const { data: timeSlots, error } = await supabaseServerClient
      .from("dining_time_slots")
      .select("*")
      .eq("venue_id", id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    // Get existing reservations for the date
    const { data: reservations } = await supabaseServerClient
      .from("dining_reservations")
      .select("reservation_time, guest_count")
      .eq("venue_id", id)
      .eq("reservation_date", date)
      .in("status", ["pending", "confirmed", "seated"]);

    // Calculate available slots
    const slotsWithAvailability = (timeSlots || []).map((slot) => {
      const reservationsAtTime =
        reservations?.filter((r) => r.reservation_time === slot.start_time) ||
        [];
      const totalGuests = reservationsAtTime.reduce(
        (sum, r) => sum + r.guest_count,
        0,
      );
      const availableCapacity = slot.max_guests_per_slot
        ? slot.max_guests_per_slot - totalGuests
        : null;

      return {
        ...slot,
        current_reservations: reservationsAtTime.length,
        current_guests: totalGuests,
        available_capacity: availableCapacity,
        is_fully_booked: availableCapacity !== null && availableCapacity <= 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        day_of_week: dayOfWeek,
        time_slots: slotsWithAvailability,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/dining/venues/[id]/timeslots:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch time slots",
      },
      { status: 500 },
    );
  }
}
