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
        const { status, reason } = body;

        const updateData: any = { status };
        if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
        if (status === 'seated') updateData.seated_at = new Date().toISOString();
        if (status === 'completed') updateData.completed_at = new Date().toISOString();
        if (status === 'cancelled') {
            updateData.cancelled_at = new Date().toISOString();
            updateData.cancellation_reason = reason;
        }

        const { data, error } = await reviewsClient
            .from("dining_reservations")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
