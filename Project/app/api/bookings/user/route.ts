import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();



        // 2. Fetch current bookings using Clerk ID directly
        // The 'bookings' table uses text user_id which stores the Clerk ID
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch bookings error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Check for expired 'held' bookings and update them lazily
        const now = new Date();
        const updates = bookings
            ?.filter((b: any) =>
                (b.status === 'held' || b.status === 'pending') &&
                b.expires_at &&
                new Date(b.expires_at) < now
            )
            .map((b: any) =>
                supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
            );

        if (updates && updates.length > 0) {
            await Promise.all(updates);
            // Re-fetch or manually update local list to reflect changes
            // For simplicity/accuracy, we mark them as cancelled in the returned array
            bookings.forEach((b: any) => {
                if ((b.status === 'held' || b.status === 'pending') && b.expires_at && new Date(b.expires_at) < now) {
                    b.status = 'cancelled';
                }
            });
        }

        return NextResponse.json(bookings || []);
    } catch (err: any) {
        console.error("User bookings API error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
