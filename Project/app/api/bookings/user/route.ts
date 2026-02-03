import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingIdParam = searchParams.get("bookingId");

  try {
    const user = await currentUser();
    const supabase = createServiceSupabaseClient();

    // --- GUEST FETCH (Specific ID) ---
    if (!user && bookingIdParam) {
      console.log("[BOOKINGS_USER_API] Guest fetch for:", bookingIdParam);
      const { data: booking, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          flight_bookings:flight_bookings!booking_id (*),
          transport_bookings:transport_bookings!booking_id (*, transport_routes:route_id (*)),
          shop_orders:shop_orders!booking_id (*)
        `,
        )
        .eq("id", bookingIdParam)
        .eq("user_id", "GUEST")
        .single();

      if (error || !booking) return NextResponse.json([]);

      return NextResponse.json([transformBooking(booking)]);
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Resolve Clerk ID to Internal UUID
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    // 2. Fetch all types of bookings in parallel
    const [
      { data: bookings, error: bookingsError },
      { data: hotelBookings, error: hotelError },
      { data: eventBookings, error: eventError },
      { data: entertainmentBookings, error: entertainmentError },
      { data: diningAppointments, error: diningError },
    ] = await Promise.all([
      // General Bookings
      (dbUser
        ? supabase.from("bookings").select(`
            *,
            flight_bookings:flight_bookings!booking_id (*),
            transport_bookings:transport_bookings!booking_id (*, transport_routes:route_id (*)),
            shop_orders:shop_orders!booking_id (*)
          `).or(`user_id.eq.${user.id},user_id.eq.${dbUser.id}`)
        : supabase.from("bookings").select(`
            *,
            flight_bookings:flight_bookings!booking_id (*),
            transport_bookings:transport_bookings!booking_id (*, transport_routes:route_id (*)),
            shop_orders:shop_orders!booking_id (*)
          `).eq("user_id", user.id)
      ).order("created_at", { ascending: false }),

      // Hotel Bookings
      supabase
        .from("hotel_bookings")
        .select(`
          *,
          hotels:hotel_id (name, slug, address, images),
          hotel_rooms:room_id (title, code)
        `)
        .eq("external_user_ref", user.id)
        .order("created_at", { ascending: false }),

      // Event Bookings
      (dbUser
        ? supabase.from("event_bookings").select(`
            *,
            events (title, slug, city, location_summary, cover_image_url),
            event_sessions (name, session_date, start_time),
            event_ticket_types (name)
          `).or(`external_user_ref.eq.${user.id},external_user_ref.eq.${dbUser.id},user_uuid.eq.${dbUser.id}`)
        : supabase.from("event_bookings").select(`
            *,
            events (title, slug, city, location_summary, cover_image_url),
            event_sessions (name, session_date, start_time),
            event_ticket_types (name)
          `).eq("external_user_ref", user.id)
      ).order("created_at", { ascending: false }),

      // Entertainment Bookings
      supabase
        .from("entertainment_bookings")
        .select(`
          *,
          item:entertainment_items(id, title, subtitle, images, location, type),
          session:entertainment_sessions(session_date, start_time, end_time)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // Dining Appointments
      (dbUser
        ? supabase.from("dining_appointment").select(`
            *,
            venue:dining_venues(id, name, address, images, city)
          `).or(`user_id.eq.${user.id},user_id.eq.${dbUser.id}`)
        : supabase.from("dining_appointment").select(`
            *,
            venue:dining_venues(id, name, address, images, city)
          `).eq("user_id", user.id)
      ).order("appointment_date", { ascending: false }),
    ]);

    if (bookingsError) {
      console.error("Fetch bookings error:", bookingsError);
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }
    if (hotelError) {
      console.error("Fetch hotel bookings error:", hotelError);
      return NextResponse.json({ error: hotelError.message }, { status: 500 });
    }
    if (eventError) {
      console.error("Fetch event bookings error:", eventError);
    }
    if (entertainmentError) {
      console.error("Fetch entertainment bookings error:", entertainmentError);
    }
    if (diningError) {
      console.error("Fetch dining appointments error:", diningError);
    }

    // Collect IDs of specialized bookings to exclude from general
    // Note: hotel_bookings might not be linked to bookings table in older records, 
    // but event_bookings are. We'll use booking_id to check.
    const specializedBookingIds = new Set([
      ...(hotelBookings || []).map((b: any) => b.booking_id).filter(Boolean),
      ...(eventBookings || []).map((b: any) => b.booking_id).filter(Boolean)
    ]);

    // Combine and transform bookings
    // Combine and transform
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
        category: "activity", // Match "activity" tab ID in BookingTabs.tsx
        type: "event",
        title: b.events?.title || "Event Booking",
        subtitle: `${b.event_sessions?.name || 'Session'} - ${b.event_ticket_types?.name || 'Ticket'}`, // e.g. "Main Show - VIP"
        image: b.events?.cover_image_url || null,
        location: b.events?.location_summary || b.events?.city || "Vietnam",
        start_date: b.event_sessions?.session_date,
        // Calculate amount if not present directly (event_bookings has total_amount)
        amount: b.total_amount,
      })),
      ...(entertainmentBookings || []).map((b: any) => ({
        ...b,
        id: b.id,
        category: "entertainment",
        type: "entertainment",
        title: b.item?.title || "Entertainment Booking",
        subtitle: b.item?.subtitle || "Event Ticket",
        image: b.item?.images?.[0] || null,
        location:
          typeof b.item?.location === "object"
            ? b.item?.location?.city
            : b.item?.location || "Event Location",
        status: b.booking_status || "confirmed",
        payment_status: b.payment_status || "pending",
        booking_reference: b.booking_reference,
        total_amount: b.total_amount,
        currency: b.currency || "USD",
        quantity: b.total_quantity || 1,
        event_date: b.session?.session_date,
        event_time: b.session?.start_time,
        created_at: b.created_at,
        customer_name: b.customer_name,
        customer_email: b.customer_email,
      })),
      ...(diningAppointments || []).map((b: any) => ({
        id: b.id,
        category: "other", // As user requested "Other" tab
        type: "dining",
        title: b.venue?.name || "Dining Reservation",
        subtitle: `${b.guest_count} Guests - ${b.appointment_time}`,
        image: b.venue?.images?.[0] || null,
        location: b.venue?.address || b.venue?.city || "Restaurant",
        status: b.status,
        start_date: b.appointment_date,
        booking_code: b.appointment_code,
        created_at: b.created_at,
        customer_name: b.guest_name,
        customer_email: b.guest_email,
      })),
      ...(bookings || []).filter((b: any) => !specializedBookingIds.has(b.id)).map(transformBooking),
    ];

    // Check for expired 'held' bookings and update them
    return NextResponse.json(await handleExpirations(allBookings, supabase));
  } catch (err: any) {
    console.error("User bookings API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function transformBooking(b: any) {
  const flight = b.flight_bookings?.[0];
  const transport = b.transport_bookings?.[0];
  const shop = b.shop_orders?.[0];

  return {
    ...b,
    category: b.category || (b.booking_type === "event" ? "activity" : b.booking_type) || "other",
    type: b.category || b.booking_type || "other",
    // Enrich with domain details
    pnr: flight?.pnr,
    order_number: shop?.order_number,
    vehicle_info: transport?.transport_routes,
  };
}

async function handleExpirations(bookings: any[], supabase: any) {
  const now = new Date();
  const expired = bookings.filter(
    (b) =>
      (b.status === "held" || b.status === "pending" || b.status === "confirmed") &&
      b.expires_at &&
      new Date(b.expires_at) < now,
  );

  if (expired.length > 0) {
    // Group expired bookings by category for efficient updates
    const updatePromises = expired.map((b) => {
      // Determine which table to update based on booking category/type
      if (b.category === "hotel") {
        return supabase
          .from("hotel_bookings")
          .update({ status: "cancelled" })
          .eq("id", b.id);
      } else if (b.category === "activity" && b.type === "event") {
        return supabase
          .from("event_bookings")
          .update({ status: "cancelled" })
          .eq("id", b.id);
      } else if (b.category === "entertainment") {
        return supabase
          .from("entertainment_bookings")
          .update({ booking_status: "cancelled" })
          .eq("id", b.id);
      } else if (b.category === "other" && b.type === "dining") {
        return supabase
          .from("dining_appointment")
          .update({ status: "cancelled" })
          .eq("id", b.id);
      } else {
        // Default to general bookings table
        return supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", b.id);
      }
    });

    // Execute all updates in parallel
    const results = await Promise.allSettled(updatePromises);

    // Log any failures for debugging
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to update expired booking ${expired[index].id}:`, result.reason);
      }
    });

    // Update status in returned data
    expired.forEach((b) => (b.status = "cancelled"));
  }
  return bookings;
}
