import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * PATCH /api/admin/partner-applications/[id]
 * Update the status of a partner application.
 * Body: { status: 'approved' | 'rejected' | 'suspended', rejection_reason?: string }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status, rejection_reason } = body;

        if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { data, error } = await reviewsClient
            .from("partner_profiles")
            .update({
                status,
                rejection_reason: rejection_reason || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;

        // If approving, also update the entity's is_active field if possible
        if (status === 'approved' && data.entity_id) {
            const entityTable: Record<string, string> = {
                hotel: 'hotels',
                transport: 'transport_providers',
                flight: 'flight_partners',
                activity: 'activity_operators',
            }
            const table = entityTable[data.partner_type]
            if (table) {
                await reviewsClient
                    .from(table)
                    .update({ is_active: true })
                    .eq('id', data.entity_id)
                    .catch(() => { }) // Non-blocking
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
