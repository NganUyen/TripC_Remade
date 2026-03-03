import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const providerId = request.nextUrl.searchParams.get("provider_id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();

        // Security check: Verify provider ownership
        const { data: provider, error: providerError } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", providerId)
            .eq("owner_id", userId)
            .single();

        if (providerError || !provider) {
            return NextResponse.json({ error: "Unauthorized or invalid provider" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("transport_drivers")
            .select("*")
            .eq("provider_id", providerId);

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[TRANSPORT_DRIVERS_GET] Error:", error);
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
            .from("transport_drivers")
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

        // 1. Get driver to find provider_id
        const { data: driver } = await supabase
            .from("transport_drivers")
            .select("provider_id")
            .eq("id", id)
            .single();

        if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

        // 2. Verify provider ownership
        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", driver.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // 3. Delete
        const { error } = await supabase
            .from("transport_drivers")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
