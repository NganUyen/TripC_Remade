import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, address, price_range = 'moderate', cuisine_type = [] } = body;

        if (!name) {
            return NextResponse.json({ error: "Restaurant name is required" }, { status: 400 });
        }

        // 1. Create the Venue
        const { data: venue, error: venueError } = await reviewsClient
            .from("dining_venues")
            .insert({
                name,
                phone,
                address,
                price_range,
                cuisine_type,
                owner_user_id: userId,
                is_active: true, // Auto-approve/active for MVP
                is_verified: true // Auto-verify for MVP
            })
            .select()
            .single();

        if (venueError) throw venueError;

        // 2. Create Default "Main Menu"
        const { error: menuError } = await reviewsClient
            .from("dining_menus")
            .insert({
                venue_id: venue.id,
                name: "Main Menu",
                is_active: true
            });

        if (menuError) {
            console.error("Failed to create default menu:", menuError);
            // Non-blocking error, user can create menu later
        }

        return NextResponse.json({ success: true, data: venue });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
