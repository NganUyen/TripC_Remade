import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();
        const { data, error } = await supabase
            .from("user_search_history")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10); // Limit to last 10 searches

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            // Silently fail or return 401. For history, silent fail is better for UX if called aggressively
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { origin, destination, searchDate } = body;

        if (!origin || !destination) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Optional: Avoid duplicates for same day? For now, just insert.
        const { error } = await supabase
            .from("user_search_history")
            .insert({
                user_id: user.id,
                origin,
                destination,
                search_date: searchDate
            });

        if (error) {
            console.error("History insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
