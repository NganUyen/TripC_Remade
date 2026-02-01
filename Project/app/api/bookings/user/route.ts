import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();

    // 1. Resolve Clerk ID to Internal UUID
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!dbUser) {
      console.warn("User not synced to DB", user.id);
      return NextResponse.json([]); // Return empty if user doesn't exist in our DB yet
    }

    // 2. Fetch hotel bookings (not general bookings)
    const { data: hotelBookings, error: hotelError } = await supabase
      .from("hotel_bookings")
      .select(
        `
                *,
                hotels:hotel_id (
                    name,
                    slug,
                    address,
                    images
                ),
                hotel_rooms:room_id (
                    title,
                    code
                )
            `,
      )
      .eq("external_user_ref", user.id)
      .order("created_at", { ascending: false });

    if (hotelError) {
      console.error("Fetch hotel bookings error:", hotelError);
      return NextResponse.json({ error: hotelError.message }, { status: 500 });
    }

    // 3. Fetch event bookings
    const { data: eventBookings, error: eventError } = await supabase
      .from("event_bookings")
      .select(
        `
                *,
                events (
                    title,
                    slug,
                    city,
                    location_summary,
                    cover_image_url
                ),
                event_sessions (
                    name,
                    session_date,
                    start_time
                ),
                event_ticket_types (
                    name
                )
            `,
      )
      .or(`external_user_ref.eq.${user.id},external_user_ref.eq.${dbUser.id},user_uuid.eq.${dbUser.id}`)
      .order("created_at", { ascending: false });

    if (eventError) {
      console.error("Fetch event bookings error:", eventError);
    }

    // 4. Also fetch general bookings (flights, etc.)
    const { data: generalBookings, error: generalError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false });

    if (generalError) {
      console.error("Fetch general bookings error:", generalError);
    }

    // Collect IDs of specialized bookings to exclude from general
    // Note: hotel_bookings might not be linked to bookings table in older records, 
    // but event_bookings are. We'll use booking_id to check.
    const specializedBookingIds = new Set([
      ...(hotelBookings || []).map((b: any) => b.booking_id).filter(Boolean),
      ...(eventBookings || []).map((b: any) => b.booking_id).filter(Boolean)
    ]);

    // Combine and transform bookings
    const allBookings = [
      ...(hotelBookings || []).map((b: any) => ({
        ...b,
        category: "hotel",
        type: "hotel",
        title: b.hotels?.name || "Hotel Booking",
        subtitle: b.hotel_rooms?.title || "Room",
        image: b.hotels?.images?.[0] || null,
        location: b.hotels?.address?.city || "Vietnam",
        start_date: b.check_in_date,
        end_date: b.check_out_date,
      })),
      ...(eventBookings || []).map((b: any) => ({
        ...b,
        category: "event", // Match tab ID
        type: "event",
        title: b.events?.title || "Event Booking",
        subtitle: `${b.event_sessions?.name || 'Session'} - ${b.event_ticket_types?.name || 'Ticket'}`, // e.g. "Main Show - VIP"
        image: b.events?.cover_image_url || null,
        location: b.events?.location_summary || b.events?.city || "Vietnam",
        start_date: b.event_sessions?.session_date,
        // Calculate amount if not present directly (event_bookings has total_amount)
        amount: b.total_amount,
      })),
      ...(generalBookings || []).filter((b: any) => !specializedBookingIds.has(b.id)).map((b: any) => ({
        ...b,
        category: b.booking_type || "other",
        type: b.booking_type || "other",
        // For general bookings, we might not have rich details unless we fetch them
        title: b.booking_type === 'flight' ? 'Flight Booking' : 'Booking',
        subtitle: `#${b.id.substring(0, 8)}`,
      })),
    ];

    // Check for expired 'held' bookings and update them
    const now = new Date();
    const expiredBookings = allBookings.filter(
      (b: any) =>
        (b.status === "held" ||
          b.status === "pending" ||
          b.status === "pending_payment") &&
        b.expires_at &&
        new Date(b.expires_at) < now,
    );

    if (expiredBookings.length > 0) {
      const hotelExpired = expiredBookings.filter(
        (b) => b.category === "hotel",
      );
      const otherExpired = expiredBookings.filter(
        (b) => b.category !== "hotel",
      );

      await Promise.all([
        ...hotelExpired.map((b: any) =>
          supabase
            .from("hotel_bookings")
            .update({ status: "cancelled" })
            .eq("id", b.id),
        ),
        ...otherExpired.map((b: any) =>
          supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", b.id),
        ),
      ]);

      // Update status in response
      expiredBookings.forEach((b: any) => {
        b.status = "cancelled";
      });
    }

    return NextResponse.json(allBookings);
  } catch (err: any) {
    console.error("User bookings API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
