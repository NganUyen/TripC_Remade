import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createServiceSupabaseClient();

        // 1. Get user's providers
        const { data: providers } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("owner_id", userId);

        if (!providers || providers.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const providerIds = providers.map(p => p.id);

        // 2. Fetch reviews
        const { data, error } = await supabase
            .from("transport_reviews")
            .select(`
                *,
                transport_routes!inner (
                    origin,
                    destination,
                    provider_id
                )
            `)
            .in("transport_routes.provider_id", providerIds)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json(); // { id, response }
        const supabase = createServiceSupabaseClient();

        // 1. Security check - ensure review belongs to user's provider
        const { data: review } = await supabase
            .from("transport_reviews")
            .select(`
                id,
                transport_routes!inner (
                    provider_id
                )
            `)
            .eq("id", body.id)
            .single();

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", (review as any).transport_routes.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // 2. Update response
        const { data, error } = await supabase
            .from("transport_reviews")
            .update({ response: body.response })
            .eq("id", body.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
