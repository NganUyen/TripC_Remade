import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * API endpoint to update all expired bookings to cancelled status
 * GET /api/bookings/update-expired
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date().toISOString();
        const results: any[] = [];

        console.log(`[UPDATE_EXPIRED] Starting update at ${now}`);

        // Update general bookings
        const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending", "confirmed"])
            .not("expires_at", "is", null)
            .lt("expires_at", now)
            .select("id");

        if (bookingsError) {
            console.error("[UPDATE_EXPIRED] Error updating bookings:", bookingsError);
        } else {
            const count = bookingsData?.length || 0;
            console.log(`[UPDATE_EXPIRED] Updated ${count} bookings`);
            results.push({ table: "bookings", count });
        }

        // Update hotel bookings
        const { data: hotelData, error: hotelError } = await supabase
            .from("hotel_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending", "confirmed"])
            .not("expires_at", "is", null)
            .lt("expires_at", now)
            .select("id");

        if (hotelError) {
            console.error("[UPDATE_EXPIRED] Error updating hotel_bookings:", hotelError);
        } else {
            const count = hotelData?.length || 0;
            console.log(`[UPDATE_EXPIRED] Updated ${count} hotel_bookings`);
            results.push({ table: "hotel_bookings", count });
        }

        // Update event bookings
        const { data: eventData, error: eventError } = await supabase
            .from("event_bookings")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending", "confirmed"])
            .not("expires_at", "is", null)
            .lt("expires_at", now)
            .select("id");

        if (eventError) {
            console.error("[UPDATE_EXPIRED] Error updating event_bookings:", eventError);
        } else {
            const count = eventData?.length || 0;
            console.log(`[UPDATE_EXPIRED] Updated ${count} event_bookings`);
            results.push({ table: "event_bookings", count });
        }

        // Update entertainment bookings
        const { data: entertainmentData, error: entertainmentError } = await supabase
            .from("entertainment_bookings")
            .update({ booking_status: "cancelled" })
            .in("booking_status", ["held", "pending", "confirmed"])
            .not("expires_at", "is", null)
            .lt("expires_at", now)
            .select("id");

        if (entertainmentError) {
            console.error("[UPDATE_EXPIRED] Error updating entertainment_bookings:", entertainmentError);
        } else {
            const count = entertainmentData?.length || 0;
            console.log(`[UPDATE_EXPIRED] Updated ${count} entertainment_bookings`);
            results.push({ table: "entertainment_bookings", count });
        }

        // Update dining appointments
        const { data: diningData, error: diningError } = await supabase
            .from("dining_appointment")
            .update({ status: "cancelled" })
            .in("status", ["held", "pending", "confirmed"])
            .not("expires_at", "is", null)
            .lt("expires_at", now)
            .select("id");

        if (diningError) {
            console.error("[UPDATE_EXPIRED] Error updating dining_appointment:", diningError);
        } else {
            const count = diningData?.length || 0;
            console.log(`[UPDATE_EXPIRED] Updated ${count} dining_appointment`);
            results.push({ table: "dining_appointment", count });
        }

        const totalUpdated = results.reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            message: `Updated ${totalUpdated} expired bookings to cancelled status`,
            results,
            timestamp: now,
        });
    } catch (error: any) {
        console.error("[UPDATE_EXPIRED] Error:", error);
        return NextResponse.json(
            { error: "Failed to update expired bookings", details: error.message },
            { status: 500 }
        );
    }
}
