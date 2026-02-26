import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const providerId = request.nextUrl.searchParams.get("provider_id");

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

        const { data, error } = await supabase
            .from("transport_vehicles")
            .select("*")
            .eq("provider_id", providerId);

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

        // 1. Verify provider ownership
        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", body.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // 2. Insert/Update
        const { data, error } = await supabase
            .from("transport_vehicles")
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

        const { data: vehicle } = await supabase
            .from("transport_vehicles")
            .select("provider_id")
            .eq("id", id)
            .single();

        if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", vehicle.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const { error } = await supabase
            .from("transport_vehicles")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
