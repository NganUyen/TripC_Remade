import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * API endpoint to check and update ALL expired or stuck bookings
 * This includes bookings with:
 * - expires_at in the past
 * - held/pending status for more than 8 minutes without expires_at
 * GET /api/bookings/fix-all-expired
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - 8 * 60 * 1000).toISOString(); // 8 minutes ago
        const results: any[] = [];

        console.log(`[FIX_ALL_EXPIRED] Starting comprehensive update at ${now.toISOString()}`);
        console.log(`[FIX_ALL_EXPIRED] Cutoff time: ${cutoffTime} (8 minutes ago)`);

        // New strategy: Cancel ALL held/pending bookings created more than 24 hours ago
        // This catches bookings with or without expires_at

        // ===== BOOKINGS TABLE =====
        const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .lt("created_at", cutoffTime)
            .select("id");

        if (bookingsError) {
            console.error("[FIX_ALL_EXPIRED] Error updating bookings:", bookingsError);
        }
        const bookingsCount = bookingsData?.length || 0;
        console.log(`[FIX_ALL_EXPIRED] Updated ${bookingsCount} bookings`);
        results.push({ table: "bookings", count: bookingsCount });

        // ===== HOTEL BOOKINGS =====
        const { data: hotelData, error: hotelError } = await supabase
            .from("hotel_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .lt("created_at", cutoffTime)
            .select("id");

        if (hotelError) {
            console.error("[FIX_ALL_EXPIRED] Error updating hotel_bookings:", hotelError);
        }
        const hotelCount = hotelData?.length || 0;
        console.log(`[FIX_ALL_EXPIRED] Updated ${hotelCount} hotel_bookings`);
        results.push({ table: "hotel_bookings", count: hotelCount });

        // ===== EVENT BOOKINGS =====
        const { data: eventData, error: eventError } = await supabase
            .from("event_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .lt("created_at", cutoffTime)
            .select("id");

        if (eventError) {
            console.error("[FIX_ALL_EXPIRED] Error updating event_bookings:", eventError);
        }
        const eventCount = eventData?.length || 0;
        console.log(`[FIX_ALL_EXPIRED] Updated ${eventCount} event_bookings`);
        results.push({ table: "event_bookings", count: eventCount });

        // ===== ENTERTAINMENT BOOKINGS =====
        const { data: entertainmentData, error: entertainmentError } = await supabase
            .from("entertainment_bookings")
            .update({ booking_status: "cancelled" })
            .in("booking_status", ["held", "pending"])
            .lt("created_at", cutoffTime)
            .select("id");

        if (entertainmentError) {
            console.error("[FIX_ALL_EXPIRED] Error updating entertainment_bookings:", entertainmentError);
        }
        const entertainmentCount = entertainmentData?.length || 0;
        console.log(`[FIX_ALL_EXPIRED] Updated ${entertainmentCount} entertainment_bookings`);
        results.push({ table: "entertainment_bookings", count: entertainmentCount });

        // ===== DINING APPOINTMENTS =====
        const { data: diningData, error: diningError } = await supabase
            .from("dining_appointment")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending"])
            .lt("created_at", cutoffTime)
            .select("id");

        if (diningError) {
            console.error("[FIX_ALL_EXPIRED] Error updating dining_appointment:", diningError);
        }
        const diningCount = diningData?.length || 0;
        console.log(`[FIX_ALL_EXPIRED] Updated ${diningCount} dining_appointment`);
        results.push({ table: "dining_appointment", count: diningCount });

        const totalUpdated = results.reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            message: `Fixed ${totalUpdated} expired/stuck bookings to cancelled status`,
            details: "Cancelled ALL held/pending bookings older than 8 minutes (regardless of expires_at field)",
            cutoff_time: cutoffTime,
            results,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("[FIX_ALL_EXPIRED] Error:", error);
        return NextResponse.json(
            { error: "Failed to fix expired bookings", details: error.message },
            { status: 500 }
        );
    }
}
