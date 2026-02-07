import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const { data: existing } = await reviewsClient
            .from("reviews")
            .select("user_id")
            .eq("id", id)
            .single();

        if (!existing) {
            return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const { data, error } = await reviewsClient
            .from("reviews")
            .update({
                rating: body.rating,
                title: body.title,
                comment: body.comment,
                photos: body.photos,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const { data: existing } = await reviewsClient
            .from("reviews")
            .select("user_id")
            .eq("id", id)
            .single();

        if (!existing) {
            return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const { error } = await reviewsClient
            .from("reviews")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
