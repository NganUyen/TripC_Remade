import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createServiceSupabaseClient();

        // Get ALL providers for this user
        const { data: providers } = await supabase
            .from("transport_providers")
            .select("id, name, commission_rate, voucher_enabled")
            .eq("owner_id", userId);

        if (!providers || providers.length === 0) {
            return NextResponse.json({ success: false, error: "No provider found" }, { status: 404 });
        }

        const providerIds = providers.map((p) => p.id);
        // Use commission_rate from first provider (or 10% default)
        const commissionRate: number = (providers[0].commission_rate as number) ?? 0.10;

        // Fetch ALL transport bookings (service role bypasses RLS)
        const { data: allBookings } = await supabase
            .from("bookings")
            .select("id, total_amount, status, created_at, metadata")
            .eq("category", "transport")
            .in("status", ["confirmed", "completed"]);

        // Filter in-memory to only this user's providers
        const bookingList = (allBookings || []).filter((b) => {
            const meta = b.metadata || {};
            const pid = meta.provider_id || meta.metadata?.provider_id;
            return pid && providerIds.includes(pid);
        });

        const totalRevenue = bookingList.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const commissionAmount = totalRevenue * commissionRate;
        const netRevenue = totalRevenue - commissionAmount;

        // Monthly breakdown (last 6 months)
        const now = new Date();
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const label = d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
            const monthBookings = bookingList.filter((b) => {
                const bd = new Date(b.created_at);
                return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
            });
            const revenue = monthBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
            return {
                month: label,
                revenue,
                commission: revenue * commissionRate,
                netRevenue: revenue * (1 - commissionRate),
                bookings: monthBookings.length,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                provider: { id: providers[0].id, name: providers[0].name, voucher_enabled: providers[0].voucher_enabled },
                commission: {
                    rate: commissionRate,
                    ratePercent: (commissionRate * 100).toFixed(0),
                    totalRevenue,
                    commissionAmount,
                    netRevenue,
                    totalBookings: bookingList.length,
                },
                monthly: monthlyData,
            },
        });
    } catch (error: any) {
        console.error("[COMMISSION_GET]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
