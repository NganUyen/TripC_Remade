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

        // 2. Fetch notifications
        const { data, error } = await supabase
            .from("transport_notifications")
            .select("*")
            .in("provider_id", providerIds)
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

        const body = await request.json(); // { id, is_read, mark_all_id }
        const supabase = createServiceSupabaseClient();

        if (body.mark_all_id) {
            // Check provider ownership
            const { data: provider } = await supabase
                .from("transport_providers")
                .select("id")
                .eq("id", body.mark_all_id)
                .eq("owner_id", userId)
                .single();

            if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

            const { error } = await supabase
                .from("transport_notifications")
                .update({ is_read: true })
                .eq("provider_id", body.mark_all_id)
                .eq("is_read", false);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        // Security check for single notification
        const { data: notif } = await supabase
            .from("transport_notifications")
            .select("provider_id")
            .eq("id", body.id)
            .single();

        if (!notif) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", notif.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // Update
        const { data, error } = await supabase
            .from("transport_notifications")
            .update({ is_read: body.is_read })
            .eq("id", body.id)
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

        const { data: notif } = await supabase
            .from("transport_notifications")
            .select("provider_id")
            .eq("id", id)
            .single();

        if (!notif) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

        const { data: provider } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("id", notif.provider_id)
            .eq("owner_id", userId)
            .single();

        if (!provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const { error } = await supabase
            .from("transport_notifications")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
