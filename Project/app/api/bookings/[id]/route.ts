
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
        // Resolve Clerk ID (user.id) to Internal UUID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', user.id)
            .single();

        if (userError || !userData) {
            console.error("User resolution failed:", userError);
            return NextResponse.json({ error: "User resolution failed" }, { status: 500 });
        }

        // Compare using both being UUIDs (or text representation of UUID)
        if (data.user_id !== userData.id) {
            console.error(`Unauthorized access attempt. Booking User: ${data.user_id}, Req User: ${userData.id} (Clerk: ${user.id})`);
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
