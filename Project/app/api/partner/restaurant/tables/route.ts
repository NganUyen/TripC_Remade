import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const venueId = searchParams.get("venue_id");
        const userId = request.headers.get("x-user-id");

        if (!venueId) {
            return NextResponse.json({ error: "Venue ID is required" }, { status: 400 });
        }

        // Verify ownership (optional but recommended)
        // const { data: venue } = await reviewsClient.from('dining_venues').select('owner_user_id').eq('id', venueId).single();
        // if (venue?.owner_user_id !== userId) ...

        const { data, error } = await reviewsClient
            .from("dining_tables")
            .select("*")
            .eq("venue_id", venueId)
            .order("table_number", { ascending: true });

        if (error) throw error;

        // Normalize data for frontend
        const normalizedData = data?.map(table => ({
            ...table,
            // Fallback: If 'capacity' is null, use 'max_capacity'
            capacity: table.capacity || table.max_capacity || 4,
            // Fallback: If 'area' is null, use 'section'
            area: table.area || table.section || 'Main'
        }));

        return NextResponse.json({ data: normalizedData });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const body = await request.json();
        const { venue_id, table_number, area, capacity, status } = body;

        if (!venue_id || !table_number) {
            return NextResponse.json({ error: "Venue ID and Table Number are required" }, { status: 400 });
        }

        // Initialize payload with required fields
        const payload: any = {
            venue_id,
            table_number,
            status: status || 'available',
            // Map frontend 'capacity' to DB 'max_capacity' (required)
            max_capacity: capacity || 4,
            min_capacity: 1,
            // Map frontend 'area' to DB 'section' (if 'area' column misses)
            section: area,
            // Also save to 'capacity' and 'area' columns if they exist (via the fix script)
            capacity: capacity || 4,
            area: area
        };

        const { data, error } = await reviewsClient
            .from("dining_tables")
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
