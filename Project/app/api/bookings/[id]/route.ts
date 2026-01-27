
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;
        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Fetch booking details
        const { data, error } = await supabase
            .from("bookings")
            .select('*')
            .eq("id", bookingId)
            .single();

        if (error) {
            console.error("Fetch booking error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Security Check: Ensure booking belongs to user
        if (data.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized access to this booking" }, { status: 403 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Booking API error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
