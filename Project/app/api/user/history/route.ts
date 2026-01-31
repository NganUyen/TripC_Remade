import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const supabase = createServiceSupabaseClient();
        let query = supabase
            .from("user_search_history")
            .select("*")
            .eq("external_user_ref", user.id); // Filter by Clerk ID

        // Filter by category if provided
        if (category) {
            query = query.eq("category", category);
        }

        const type = searchParams.get("type");
        if (type) {
            query = query.contains("search_params", { type });
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(10); // Limit to last 10 searches

        if (error) {
            console.error("History fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error("History GET error:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { category, searchParams: searchParamsData } = body;

        if (!category || !searchParamsData) {
            return NextResponse.json({ error: "Missing category or searchParams" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Get internal Supabase user UUID
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

        if (userError || !userData) {
            console.error("User lookup error:", userError);
            // Fallback: If user isn't in Supabase yet, we might want to sync them here
            // but for now we'll just return an error or handle it
            return NextResponse.json({ error: "User not synced to database" }, { status: 400 });
        }

        const internalUserId = userData.id;

        // Check if the most recent search is identical to the new one
        const { data: recent } = await supabase
            .from("user_search_history")
            .select("search_params")
            .eq("user_id", internalUserId)
            .eq("category", category)
            .order("created_at", { ascending: false })
            .limit(1);

        if (recent && recent.length > 0) {
            const lastSearchMatches = JSON.stringify(recent[0].search_params) === JSON.stringify(searchParamsData);
            if (lastSearchMatches) {
                return NextResponse.json({ success: true, duplicate: true });
            }
        }

        const { error } = await supabase
            .from("user_search_history")
            .insert({
                user_id: internalUserId,
                external_user_ref: user.id,
                category: category,
                search_params: searchParamsData
            });

        if (error) {
            console.error("History insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("History POST error:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
