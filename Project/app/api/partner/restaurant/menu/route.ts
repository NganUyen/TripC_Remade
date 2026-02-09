import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

// GET: List all menu items for a venue (Partner Side - Service Role)
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const venueId = searchParams.get("venue_id");

        if (!venueId) {
            return NextResponse.json({ error: "Venue ID is required" }, { status: 400 });
        }

        // Verify ownership
        const { data: venue } = await reviewsClient
            .from('dining_venues')
            .select('id')
            .eq('id', venueId)
            .eq('owner_user_id', userId)
            .single();

        if (!venue) {
            return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 });
        }

        const { data, error } = await reviewsClient
            .from("dining_menu_items")
            .select("*")
            .eq("venue_id", venueId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { venue_id, ...itemData } = body;

        // Verify ownership of venue
        const { data: venue } = await reviewsClient
            .from('dining_venues')
            .select('id')
            .eq('id', venue_id)
            .eq('owner_user_id', userId)
            .single();

        if (!venue) {
            return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 });
        }

        // Get default menu or create if none (simplified logic)
        // ideally we pass menu_id, but here auto-assigned to first menu of venue
        let { data: menu } = await reviewsClient
            .from('dining_menus')
            .select('id')
            .eq('venue_id', venue_id)
            .single();

        if (!menu) {
            const { data: newMenu } = await reviewsClient
                .from('dining_menus')
                .insert({ venue_id, name: 'Main Menu' })
                .select()
                .single();
            menu = newMenu;
        }

        // Initialize payload with white-listed fields to avoid schema errors
        const payload = {
            venue_id,
            menu_id: menu.id,
            name: itemData.name,
            description: itemData.description,
            price: parseFloat(itemData.price) || 0,
            currency: itemData.currency || 'VND',
            category: itemData.category,
            image_url: itemData.image_url,
            is_available: itemData.is_available !== undefined ? itemData.is_available : true,
            display_order: itemData.display_order || 0
        };

        const { data, error } = await reviewsClient
            .from("dining_menu_items")
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
