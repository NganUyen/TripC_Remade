import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = params.id;
        const body = await request.json();

        // Security check: ensure user owns this venue before updating
        const { data: venue } = await reviewsClient
            .from("dining_venues")
            .select("id")
            .eq("id", id)
            .eq("owner_user_id", userId)
            .single();

        if (!venue) {
            return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 404 });
        }

        const { data, error } = await reviewsClient
            .from("dining_venues")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
