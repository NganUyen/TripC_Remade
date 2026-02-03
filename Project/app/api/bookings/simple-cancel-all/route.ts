import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Simple force cancel - Update each booking individually to avoid trigger issues
 * GET /api/bookings/simple-cancel-all
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date();
        let totalCancelled = 0;
        const results: any[] = [];

        console.log(`[SIMPLE_CANCEL] Starting simple cleanup at ${now.toISOString()}`);

        // Get all held/pending bookings first
        const { data: pendingBookings } = await supabase
            .from("bookings")
            .select("id, user_id")
            .in("status", ["held", "pending"]);

        console.log(`[SIMPLE_CANCEL] Found ${pendingBookings?.length || 0} pending bookings`);

        // Update each booking individually to avoid trigger issues
        if (pendingBookings && pendingBookings.length > 0) {
            for (const booking of pendingBookings) {
                const { error } = await supabase
                    .from("bookings")
                    .update({ status: "cancelled" })
                    .eq("id", booking.id);

                if (!error) {
                    totalCancelled++;
                } else {
                    console.error(`[SIMPLE_CANCEL] Failed to cancel booking ${booking.id}:`, error);
                }
            }
        }

        results.push({ table: "bookings", count: totalCancelled });

        // Hotel bookings
        const { data: hotelBookings } = await supabase
            .from("hotel_bookings")
            .select("id")
            .in("status", ["held", "pending"]);

        let hotelCancelled = 0;
        if (hotelBookings && hotelBookings.length > 0) {
            for (const booking of hotelBookings) {
                const { error } = await supabase
                    .from("hotel_bookings")
                    .update({ status: "cancelled" })
                    .eq("id", booking.id);

                if (!error) hotelCancelled++;
            }
        }
        results.push({ table: "hotel_bookings", count: hotelCancelled });

        // Event bookings
        const { data: eventBookings } = await supabase
            .from("event_bookings")
            .select("id")
            .in("status", ["held", "pending"]);

        let eventCancelled = 0;
        if (eventBookings && eventBookings.length > 0) {
            for (const booking of eventBookings) {
                const { error } = await supabase
                    .from("event_bookings")
                    .update({ status: "cancelled" })
                    .eq("id", booking.id);

                if (!error) eventCancelled++;
            }
        }
        results.push({ table: "event_bookings", count: eventCancelled });

        // Entertainment bookings
        const { data: entertainmentBookings } = await supabase
            .from("entertainment_bookings")
            .select("id")
            .in("booking_status", ["held", "pending"]);

        let entertainmentCancelled = 0;
        if (entertainmentBookings && entertainmentBookings.length > 0) {
            for (const booking of entertainmentBookings) {
                const { error } = await supabase
                    .from("entertainment_bookings")
                    .update({ booking_status: "cancelled" })
                    .eq("id", booking.id);

                if (!error) entertainmentCancelled++;
            }
        }
        results.push({ table: "entertainment_bookings", count: entertainmentCancelled });

        // Dining appointments
        const { data: diningBookings } = await supabase
            .from("dining_appointment")
            .select("id")
            .in("status", ["held", "pending"]);

        let diningCancelled = 0;
        if (diningBookings && diningBookings.length > 0) {
            for (const booking of diningBookings) {
                const { error } = await supabase
                    .from("dining_appointment")
                    .update({ status: "cancelled" })
                    .eq("id", booking.id);

                if (!error) diningCancelled++;
            }
        }
        results.push({ table: "dining_appointment", count: diningCancelled });

        const total = results.reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            message: `Successfully cancelled ${total} stuck bookings`,
            details: "Updated each booking individually to avoid trigger issues",
            results,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("[SIMPLE_CANCEL] Error:", error);
        return NextResponse.json(
            { error: "Failed to cancel bookings", details: error.message },
            { status: 500 }
        );
    }
}
