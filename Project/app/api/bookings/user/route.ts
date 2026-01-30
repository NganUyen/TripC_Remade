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

    // Also fetch general bookings (flights, activities, etc.)
    const { data: generalBookings, error: generalError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false });

    if (generalError) {
      console.error("Fetch general bookings error:", generalError);
    }

    // Combine and transform bookings
    const allBookings = [
      ...(hotelBookings || []).map((b: any) => ({
        ...b,
        category: "hotel", // Match tab ID
        type: "hotel",
        title: b.hotels?.name || "Hotel Booking",
        subtitle: b.hotel_rooms?.title || "Room",
        image: b.hotels?.images?.[0] || null,
        location: b.hotels?.address?.city || "Vietnam",
      })),
      ...(generalBookings || []).map((b: any) => ({
        ...b,
        category: b.booking_type || "other",
        type: b.booking_type || "other",
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
