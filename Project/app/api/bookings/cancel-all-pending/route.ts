import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * AGGRESSIVE cleanup - Cancel ALL held/pending bookings
 * This is a one-time cleanup to fix the stuck bookings issue
 * GET /api/bookings/cancel-all-pending
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date();
        const results: any[] = [];

        console.log(`[CANCEL_ALL_PENDING] Starting aggressive cleanup at ${now.toISOString()}`);

        // Cancel ALL held/pending bookings regardless of age
        // This is a one-time fix for the accumulated stuck bookings

        // ===== BOOKINGS TABLE =====
        const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id, title, created_at");

        if (bookingsError) {
            console.error("[CANCEL_ALL_PENDING] Error updating bookings:", bookingsError);
        }
        const bookingsCount = bookingsData?.length || 0;
        console.log(`[CANCEL_ALL_PENDING] Updated ${bookingsCount} bookings`);
        results.push({ table: "bookings", count: bookingsCount, sample: bookingsData?.slice(0, 3) });

        // ===== HOTEL BOOKINGS =====
        const { data: hotelData, error: hotelError } = await supabase
            .from("hotel_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id, created_at");

        if (hotelError) {
            console.error("[CANCEL_ALL_PENDING] Error updating hotel_bookings:", hotelError);
        }
        const hotelCount = hotelData?.length || 0;
        console.log(`[CANCEL_ALL_PENDING] Updated ${hotelCount} hotel_bookings`);
        results.push({ table: "hotel_bookings", count: hotelCount, sample: hotelData?.slice(0, 3) });

        // ===== EVENT BOOKINGS =====
        const { data: eventData, error: eventError } = await supabase
            .from("event_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id, created_at");

        if (eventError) {
            console.error("[CANCEL_ALL_PENDING] Error updating event_bookings:", eventError);
        }
        const eventCount = eventData?.length || 0;
        console.log(`[CANCEL_ALL_PENDING] Updated ${eventCount} event_bookings`);
        results.push({ table: "event_bookings", count: eventCount, sample: eventData?.slice(0, 3) });

        // ===== ENTERTAINMENT BOOKINGS =====
        const { data: entertainmentData, error: entertainmentError } = await supabase
            .from("entertainment_bookings")
            .update({ booking_status: "cancelled" })
            .in("booking_status", ["held", "pending"])
            .select("id, created_at");

        if (entertainmentError) {
            console.error("[CANCEL_ALL_PENDING] Error updating entertainment_bookings:", entertainmentError);
        }
        const entertainmentCount = entertainmentData?.length || 0;
        console.log(`[CANCEL_ALL_PENDING] Updated ${entertainmentCount} entertainment_bookings`);
        results.push({ table: "entertainment_bookings", count: entertainmentCount, sample: entertainmentData?.slice(0, 3) });

        // ===== DINING APPOINTMENTS =====
        const { data: diningData, error: diningError } = await supabase
            .from("dining_appointment")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id, created_at");

        if (diningError) {
            console.error("[CANCEL_ALL_PENDING] Error updating dining_appointment:", diningError);
        }
        const diningCount = diningData?.length || 0;
        console.log(`[CANCEL_ALL_PENDING] Updated ${diningCount} dining_appointment`);
        results.push({ table: "dining_appointment", count: diningCount, sample: diningData?.slice(0, 3) });

        const totalUpdated = results.reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            message: `Cancelled ${totalUpdated} stuck bookings`,
            details: "AGGRESSIVE CLEANUP: Cancelled ALL held/pending bookings to fix accumulated stuck bookings",
            warning: "This is a one-time cleanup operation",
            results,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("[CANCEL_ALL_PENDING] Error:", error);
        return NextResponse.json(
            { error: "Failed to cancel pending bookings", details: error.message },
            { status: 500 }
        );
    }
}
