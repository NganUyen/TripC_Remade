import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * GET /api/admin/partner-applications
 * Returns all partner profile registrations from partner_profiles table.
 * Admin-only endpoint — add your own auth check here if needed.
 */
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await reviewsClient
            .from("partner_profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
