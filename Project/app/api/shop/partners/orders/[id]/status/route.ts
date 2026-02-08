import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, PartnerError } from '@/lib/shop/partner-queries';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        const partner = await requirePartnerAccess(userId);

        if (partner.role === 'staff' && !partner.permissions?.orders) {
            return errorResponse('FORBIDDEN', 'You do not have orders permission', 403);
        }

        const { id: orderId } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const { status, tracking_number, tracking_url } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return errorResponse('VALIDATION_ERROR', `status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
        }

        // Verify this order contains partner items
        const supabase = createServiceSupabaseClient();

        const { data: partnerItems } = await supabase
            .from('order_items')
            .select('id')
            .eq('partner_id', partner.id)
            .eq('order_id', orderId);

        if (!partnerItems || partnerItems.length === 0) {
            return errorResponse('NOT_FOUND', 'Order not found', 404);
        }

        // Update order status
        const updateData: Record<string, unknown> = { status };
        if (tracking_number) updateData.tracking_number = tracking_number;
        if (tracking_url) updateData.tracking_url = tracking_url;

        const { data: updated, error } = await supabase
            .from('shop_orders')
            .update(updateData)
            .eq('id', orderId)
            .select('id, status, updated_at')
            .single();

        if (error || !updated) {
            return errorResponse('INTERNAL_ERROR', 'Failed to update order status', 500);
        }

        // Log audit
        await supabase.from('shop_partner_audit_logs').insert({
            partner_id: partner.id,
            actor_id: userId,
            action: 'order_status_update',
            entity_type: 'order',
            entity_id: orderId,
            new_values: { status, tracking_number, tracking_url },
        });

        return successResponse(updated);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner order status PATCH error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to update order status', 500);
    }
}
