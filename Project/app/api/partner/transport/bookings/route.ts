import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /api/partner/transport/bookings
 * Fetches transport bookings for providers owned by the authenticated user.
 * Bypasses RLS using Service Role to ensure all transport-specific meta is visible.
 */
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();

        // 1. Get the providers owned by this user
        const { data: providers, error: providersError } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("owner_id", userId);

        if (providersError) throw providersError;
        if (!providers || providers.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const providerIds = providers.map(p => p.id);

        // 2. Fetch bookings categorized as transport
        // We fetch ALL transport bookings and filter in memory to ensure mapping robustness
        // (Since some older bookings might only have provider ID in nested metadata)
        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .eq("category", "transport")
            .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;

        // 3. Filter bookings by provider_id in metadata
        const filteredBookings = (bookings || []).filter(booking => {
            const meta = booking.metadata || {};
            const providerId =
                meta.provider_id ||
                meta.metadata?.provider_id ||
                meta.route?.provider_id ||
                meta.transport_providers?.id;

            return providerId && providerIds.includes(providerId);
        });

        return NextResponse.json({ success: true, data: filteredBookings });
    } catch (error: any) {
        console.error("[TRANSPORT_BOOKINGS_GET] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
