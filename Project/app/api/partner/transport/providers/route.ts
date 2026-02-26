import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();
        const { data, error } = await supabase
            .from("transport_providers")
            .select("*")
            .eq("owner_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[TRANSPORT_PROVIDERS_GET] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        console.log("[TRANSPORT_PROVIDERS_POST] UserId:", userId);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        console.log("[TRANSPORT_PROVIDERS_POST] Body:", body);

        const supabase = createServiceSupabaseClient();

        // If ID is provided, it's an update, otherwise it's an insert
        const { data, error } = await supabase
            .from("transport_providers")
            .upsert({
                ...body,
                owner_id: userId,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("[TRANSPORT_PROVIDERS_POST] Supabase Error:", error);
            throw error;
        }

        console.log("[TRANSPORT_PROVIDERS_POST] Success:", data);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[TRANSPORT_PROVIDERS_POST] Unexpected Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!providerId) {
            return NextResponse.json({ error: "Missing provider ID" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Verify ownership and delete
        const { error } = await supabase
            .from("transport_providers")
            .delete()
            .eq("id", providerId)
            .eq("owner_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Provider deleted successfully" });
    } catch (error: any) {
        console.error("[TRANSPORT_PROVIDERS_DELETE] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
