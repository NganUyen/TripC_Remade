import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

// GET - list vouchers created by this provider
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createServiceSupabaseClient();

        const { data: providers } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("owner_id", userId);

        if (!providers?.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const providerId = providers[0].id;

        // Fetch vouchers and filter by provider_id in metadata (don't rely on voucher_type alone)
        const { data: vouchers, error } = await supabase
            .from("vouchers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Filter to this provider's vouchers based on metadata
        const myVouchers = (vouchers || []).filter((v: any) => {
            const meta = v.metadata || {};
            return meta.provider_id === providerId;
        });

        return NextResponse.json({ success: true, data: myVouchers });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create a new voucher for transport routes
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { code, discount_value, min_spend, expires_at, total_usage_limit, description } = body;

        if (!code || !discount_value) {
            return NextResponse.json({ error: "code and discount_value are required" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        const { data: providers } = await supabase
            .from("transport_providers")
            .select("id, name")
            .eq("owner_id", userId);

        if (!providers?.length) {
            return NextResponse.json({ error: "No provider found" }, { status: 404 });
        }

        const provider = providers[0];

        const { data, error } = await supabase
            .from("vouchers")
            .insert({
                code: code.toUpperCase().trim(),
                voucher_type: "transport",
                discount_value: Number(discount_value),
                min_spend: Number(min_spend) || 0,
                expires_at: expires_at || null,
                total_usage_limit: total_usage_limit ? Number(total_usage_limit) : null,
                is_active: true,
                is_purchasable: false,
                metadata: {
                    provider_id: provider.id,
                    provider_name: provider.name,
                    description: description || "",
                },
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[VOUCHER_POST]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - deactivate a voucher
export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { voucherId } = await request.json();
        if (!voucherId) return NextResponse.json({ error: "voucherId required" }, { status: 400 });

        const supabase = createServiceSupabaseClient();

        const { data: providers } = await supabase
            .from("transport_providers")
            .select("id")
            .eq("owner_id", userId);

        if (!providers?.length) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const providerId = providers[0].id;

        // Verify ownership
        const { data: voucher } = await supabase.from("vouchers").select("metadata").eq("id", voucherId).single();
        if (!voucher || (voucher.metadata as any)?.provider_id !== providerId) {
            return NextResponse.json({ error: "Voucher not found or unauthorized" }, { status: 403 });
        }

        const { error } = await supabase
            .from("vouchers")
            .update({ is_active: false })
            .eq("id", voucherId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Voucher deactivated" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
