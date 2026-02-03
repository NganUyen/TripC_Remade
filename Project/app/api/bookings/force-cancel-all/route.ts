import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * FORCE cancel ALL pending bookings using raw SQL
 * Bypasses RLS to ensure all stuck bookings are cancelled
 * GET /api/bookings/force-cancel-all
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date();
        const results: any[] = [];

        console.log(`[FORCE_CANCEL] Starting FORCE cleanup at ${now.toISOString()}`);

        // Cancel ALL held/pending bookings using direct Supabase client
        // Service role client bypasses RLS automatically

        // ===== BOOKINGS TABLE =====
        const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id, title");

        if (bookingsError) {
            console.error("[FORCE_CANCEL] Error updating bookings:", bookingsError);
            results.push({ table: "bookings", count: 0, error: bookingsError.message });
        } else {
            const count = bookingsData?.length || 0;
            console.log(`[FORCE_CANCEL] Updated ${count} bookings`);
            results.push({ table: "bookings", count, sample: bookingsData?.slice(0, 3) });
        }

        // ===== HOTEL BOOKINGS =====
        const { data: hotelData, error: hotelError } = await supabase
            .from("hotel_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id");

        if (hotelError) {
            console.error("[FORCE_CANCEL] Error updating hotel_bookings:", hotelError);
            results.push({ table: "hotel_bookings", count: 0, error: hotelError.message });
        } else {
            const count = hotelData?.length || 0;
            console.log(`[FORCE_CANCEL] Updated ${count} hotel_bookings`);
            results.push({ table: "hotel_bookings", count, sample: hotelData?.slice(0, 3) });
        }

        // ===== EVENT BOOKINGS =====
        const { data: eventData, error: eventError } = await supabase
            .from("event_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id");

        if (eventError) {
            console.error("[FORCE_CANCEL] Error updating event_bookings:", eventError);
            results.push({ table: "event_bookings", count: 0, error: eventError.message });
        } else {
            const count = eventData?.length || 0;
            console.log(`[FORCE_CANCEL] Updated ${count} event_bookings`);
            results.push({ table: "event_bookings", count, sample: eventData?.slice(0, 3) });
        }

        // ===== ENTERTAINMENT BOOKINGS =====
        const { data: entertainmentData, error: entertainmentError } = await supabase
            .from("entertainment_bookings")
            .update({ booking_status: "cancelled" })
            .in("booking_status", ["held", "pending"])
            .select("id");

        if (entertainmentError) {
            console.error("[FORCE_CANCEL] Error updating entertainment_bookings:", entertainmentError);
            results.push({ table: "entertainment_bookings", count: 0, error: entertainmentError.message });
        } else {
            const count = entertainmentData?.length || 0;
            console.log(`[FORCE_CANCEL] Updated ${count} entertainment_bookings`);
            results.push({ table: "entertainment_bookings", count, sample: entertainmentData?.slice(0, 3) });
        }

        // ===== DINING APPOINTMENTS =====
        const { data: diningData, error: diningError } = await supabase
            .from("dining_appointment")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .select("id");

        if (diningError) {
            console.error("[FORCE_CANCEL] Error updating dining_appointment:", diningError);
            results.push({ table: "dining_appointment", count: 0, error: diningError.message });
        } else {
            const count = diningData?.length || 0;
            console.log(`[FORCE_CANCEL] Updated ${count} dining_appointment`);
            results.push({ table: "dining_appointment", count, sample: diningData?.slice(0, 3) });
        }

        const totalUpdated = results.reduce((sum, r) => sum + (r.count || 0), 0);

        return NextResponse.json({
            success: true,
            message: `Force cancelled ${totalUpdated} stuck bookings`,
            details: "Cancelled ALL held/pending bookings using service role (bypasses RLS)",
            results,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("[FORCE_CANCEL] Error:", error);
        return NextResponse.json(
            { error: "Failed to force cancel bookings", details: error.message },
            { status: 500 }
        );
    }
}
