import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        const body = await request.json();
        const { id } = params;

        // Extract allowed fields to update
        const { table_number, area, capacity, status, current_guests } = body;

        const payload: any = {
            table_number,
            status,
            current_guests,
            updated_at: new Date().toISOString()
        };

        if (capacity) {
            payload.max_capacity = capacity;
            payload.capacity = capacity;
        }

        if (area) {
            payload.section = area;
            payload.area = area;
        }

        const { data, error } = await reviewsClient
            .from("dining_tables")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { error } = await reviewsClient
            .from("dining_tables")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
