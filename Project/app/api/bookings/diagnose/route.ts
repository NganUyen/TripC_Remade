import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint to check all held/pending bookings
 * GET /api/bookings/diagnose
 */
export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();
        const now = new Date();

        // Check all held/pending bookings across all tables
        const { data: bookings } = await supabase
            .from("bookings")
            .select("id, status, created_at, expires_at, category, title")
            .in("status", ["held", "pending"])
            .order("created_at", { ascending: false });

        const { data: hotelBookings } = await supabase
            .from("hotel_bookings")
            .select("id, status, created_at, expires_at")
            .in("status", ["held", "pending"])
            .order("created_at", { ascending: false });

        const { data: eventBookings } = await supabase
            .from("event_bookings")
            .select("id, status, created_at, expires_at")
            .in("status", ["held", "pending"])
            .order("created_at", { ascending: false });

        const { data: entertainmentBookings } = await supabase
            .from("entertainment_bookings")
            .select("id, booking_status, created_at, expires_at")
            .in("booking_status", ["held", "pending"])
            .order("created_at", { ascending: false });

        const { data: diningAppointments } = await supabase
            .from("dining_appointment")
            .select("id, status, created_at, expires_at")
            .in("status", ["held", "pending"])
            .order("created_at", { ascending: false });

        // Analyze each booking
        const analyzeBooking = (b: any, table: string) => {
            const createdAt = new Date(b.created_at);
            const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
            const hasExpiry = !!b.expires_at;
            const isExpired = hasExpiry && new Date(b.expires_at) < now;

            return {
                table,
                id: b.id,
                status: b.status || b.booking_status,
                title: b.title || "N/A",
                category: b.category || table,
                created_at: b.created_at,
                age_minutes: Math.round(ageMinutes * 10) / 10,
                has_expiry: hasExpiry,
                expires_at: b.expires_at,
                is_expired: isExpired,
                should_cancel: isExpired || (!hasExpiry && ageMinutes > 8)
            };
        };

        const analysis = [
            ...(bookings || []).map(b => analyzeBooking(b, "bookings")),
            ...(hotelBookings || []).map(b => analyzeBooking(b, "hotel_bookings")),
            ...(eventBookings || []).map(b => analyzeBooking(b, "event_bookings")),
            ...(entertainmentBookings || []).map(b => analyzeBooking(b, "entertainment_bookings")),
            ...(diningAppointments || []).map(b => analyzeBooking(b, "dining_appointment"))
        ];

        const shouldCancel = analysis.filter(a => a.should_cancel);

        return NextResponse.json({
            total_held_pending: analysis.length,
            should_be_cancelled: shouldCancel.length,
            bookings_to_cancel: shouldCancel,
            all_held_pending: analysis,
            timestamp: now.toISOString()
        });
    } catch (error: any) {
        console.error("[DIAGNOSE] Error:", error);
        return NextResponse.json(
            { error: "Failed to diagnose bookings", details: error.message },
            { status: 500 }
        );
    }
}
