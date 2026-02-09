import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const venueId = searchParams.get("venue_id");
        const status = searchParams.get("status");

        let query = reviewsClient
            .from("dining_reservations")
            .select("*")
            .eq("venue_id", venueId)
            .order("reservation_date", { ascending: false })
            .order("reservation_time", { ascending: false });

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
