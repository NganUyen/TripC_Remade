import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 },
      );
    }

    const supabase = createServiceSupabaseClient();

    // 1. Try fetching from unified bookings table first
    // Use maybeSingle to avoid 500 errors on missing rows
    const { data: unifiedData, error: unifiedError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (unifiedError) {
      console.error("Fetch booking error:", unifiedError);
      return NextResponse.json(
        { error: unifiedError.message },
        { status: 500 },
      );
    }

    let data = unifiedData;

    // 2. Fallback: Search in specialized tables if not found in unified table
    if (!data) {
      // Try Hotel Bookings
      const { data: hotel } = await supabase
        .from("hotel_bookings")
        .select(
          `
                    *,
                    hotels:hotel_id (name, slug, images, address),
                    hotel_rooms:room_id (title)
                `,
        )
        .eq("id", bookingId)
        .maybeSingle();

      if (hotel) {
        data = {
          ...hotel,
          category: "hotel",
          title: hotel.hotels?.name || "Khách sạn",
          description: hotel.hotel_rooms?.title || "Đặt phòng khách sạn",
          image_url: hotel.hotels?.images?.[0] || null,
          total_amount: hotel.total_amount,
          currency: hotel.currency || "USD",
          user_id: hotel.user_uuid || hotel.external_user_ref,
        };
      }
    }

    // Try Activity/Event Bookings
    if (!data) {
      const { data: event } = await supabase
        .from("event_bookings")
        .select(
          `
                    *,
                    events:event_id (title, images, description)
                `,
        )
        .eq("id", bookingId)
        .maybeSingle();

      if (event) {
        data = {
          ...event,
          category: "activity",
          title: event.events?.title || "Hoạt động",
          description: event.events?.description || "Đặt vé hoạt động",
          image_url: event.events?.images?.[0] || null,
          total_amount: event.total_amount,
          currency: event.currency || "USD",
          user_id: event.user_uuid || event.external_user_ref,
        };
      }
    }

    // Final check: Not found
    if (!data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 4. Security Check: Ensure booking belongs to user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .maybeSingle();

    if (userError) {
      console.error("User resolution failed:", userError);
      return NextResponse.json(
        { error: "User resolution failed" },
        { status: 500 },
      );
    }

    // Compare ownership
    const ownerId = data.user_id || data.user_uuid || data.external_user_ref;
    if (ownerId && ownerId !== "GUEST") {
      const matchesUuid = userData && ownerId === userData.id;
      const matchesClerk = ownerId === user.id;

      if (!matchesUuid && !matchesClerk) {
        console.error(
          `Unauthorized access attempt. Booking User: ${ownerId}, Requestor ClerkID: ${user.id}`,
        );
        return NextResponse.json(
          { error: "Unauthorized access to this booking" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
