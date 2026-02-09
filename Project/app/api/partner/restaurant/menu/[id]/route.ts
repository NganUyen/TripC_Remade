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

        // Ensure user owns the venue of this item
        // We do a join or two-step check. simplified:
        const { data: item } = await reviewsClient
            .from("dining_menu_items")
            .select("venue_id")
            .eq("id", id)
            .single();

        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        const { data: venue } = await reviewsClient
            .from("dining_venues")
            .select("id")
            .eq("id", item.venue_id)
            .eq("owner_user_id", userId)
            .single();

        if (!venue) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // Construct safe payload for update
        const payload: any = {
            updated_at: new Date().toISOString()
        };

        if (body.name !== undefined) payload.name = body.name;
        if (body.description !== undefined) payload.description = body.description;
        if (body.price !== undefined) payload.price = parseFloat(body.price) || 0;
        if (body.currency !== undefined) payload.currency = body.currency;
        if (body.category !== undefined) payload.category = body.category;
        if (body.image_url !== undefined) payload.image_url = body.image_url;
        if (body.is_available !== undefined) payload.is_available = body.is_available;
        if (body.display_order !== undefined) payload.display_order = body.display_order;

        const { data, error } = await reviewsClient
            .from("dining_menu_items")
            .update(payload)
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
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = params.id;

        // Ensure user owns the venue
        const { data: item } = await reviewsClient
            .from("dining_menu_items")
            .select("venue_id")
            .eq("id", id)
            .single();

        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        const { data: venue } = await reviewsClient
            .from("dining_venues")
            .select("id")
            .eq("id", item.venue_id)
            .eq("owner_user_id", userId)
            .single();

        if (!venue) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const { error } = await reviewsClient
            .from("dining_menu_items")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
