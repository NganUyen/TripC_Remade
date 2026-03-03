import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const providerId = request.nextUrl.searchParams.get("provider_id");

        const startDate = request.nextUrl.searchParams.get("start_date");
        const endDate = request.nextUrl.searchParams.get("end_date");

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createServiceSupabaseClient();

        // Security check
        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", providerId)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        let query = supabase
            .from("transport_routes")
            .select(`
                *,
                transport_providers (name, logo_url),
                transport_vehicles (plate_number, model)
            `)
            .eq("provider_id", providerId);

        if (startDate) {
            query = query.gte("departure_time", startDate);
        }
        if (endDate) {
            query = query.lte("departure_time", endDate);
        }

        const { data, error } = await query.order("departure_time", { ascending: true });

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

        const body = await request.json();
        const supabase = createServiceSupabaseClient();

        if (!body.provider_id) return NextResponse.json({ error: "Missing provider_id" }, { status: 400 });

        // 1. Verify provider ownership
        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", body.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized: You do not own this provider or it does not exist" }, { status: 403 });

        // 2. Insert/Update
        const { data, error } = await supabase
            .from("transport_routes")
            .upsert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const id = request.nextUrl.searchParams.get("id");
        if (!userId || !id) return NextResponse.json({ error: "Unauthorized or Missing ID" }, { status: 401 });

        const supabase = createServiceSupabaseClient();

        const { data: route } = await supabase
            .from("transport_routes")
            .select("provider_id")
            .eq("id", id)
            .single();

        if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", route.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const { error } = await supabase
            .from("transport_routes")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
