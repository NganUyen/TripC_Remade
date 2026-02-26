import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: routeId } = params;
        const body = await request.json();
        const { seats_available, total_capacity } = body;

        // Validate
        if (typeof seats_available !== "number" || seats_available < 0) {
            return NextResponse.json({ error: "Invalid seats count" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Ensure the user actually owns the provider for this route
        // 1. Get user's providers
        const { data: providers, error: providersError } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("owner_id", userId);

        if (providersError) throw providersError;
        const providerIds = (providers || []).map((p) => p.id);

        if (providerIds.length === 0) {
            return NextResponse.json({ error: "No providers found for user" }, { status: 403 });
        }

        // 2. Verify route belongs to user
        const { data: route, error: routeError } = await supabase
            .from("transport_routes")
            .select("id, provider_id")
            .eq("id", routeId)
            .single();

        if (routeError || !route || !providerIds.includes(route.provider_id)) {
            return NextResponse.json({ error: "Route not found or unauthorized" }, { status: 403 });
        }

        // 3. Build update payload — include total_capacity if provided
        const updatePayload: any = { seats_available };
        if (typeof total_capacity === "number" && total_capacity >= 0) {
            updatePayload.total_capacity = total_capacity;
        }

        const { error: updateError } = await supabase
            .from("transport_routes")
            .update(updatePayload)
            .eq("id", routeId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: "Seats updated", seats_available });
    } catch (error: any) {
        console.error("[TRANSPORT_ROUTES_SEATS_PATCH] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
