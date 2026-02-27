import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, PartnerError } from '@/lib/shop/partner-queries';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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

        // Check for items already tagged with partner_id
        const { data: taggedItems } = await supabase
            .from('order_items')
            .select('id')
            .eq('partner_id', partner.id)
            .eq('order_id', orderId);

        let hasPartnerItems = (taggedItems && taggedItems.length > 0);

        // If no tagged items, check via product ownership (for items created before partner_id backfill)
        if (!hasPartnerItems) {
            const { data: untaggedItems } = await supabase
                .from('order_items')
                .select('id, variant_id')
                .eq('order_id', orderId)
                .is('partner_id', null);

            if (untaggedItems && untaggedItems.length > 0) {
                // Check which variants belong to this partner's products
                const variantIds = untaggedItems.map(i => i.variant_id).filter(Boolean);
                if (variantIds.length > 0) {
                    const { data: partnerVariants } = await supabase
                        .from('product_variants')
                        .select('id, product_id')
                        .in('id', variantIds);

                    if (partnerVariants && partnerVariants.length > 0) {
                        const productIds = [...new Set(partnerVariants.map(v => v.product_id))];
                        const { data: partnerProducts } = await supabase
                            .from('shop_products')
                            .select('id')
                            .in('id', productIds)
                            .eq('partner_id', partner.id);

                        if (partnerProducts && partnerProducts.length > 0) {
                            const partnerProductIds = new Set(partnerProducts.map(p => p.id));
                            const itemsToTag = untaggedItems.filter(item => {
                                const pv = partnerVariants.find(v => v.id === item.variant_id);
                                return pv && partnerProductIds.has(pv.product_id);
                            });

                            if (itemsToTag.length > 0) {
                                // Backfill partner_id on these items
                                await supabase
                                    .from('order_items')
                                    .update({ partner_id: partner.id })
                                    .in('id', itemsToTag.map(i => i.id));
                                hasPartnerItems = true;
                            }
                        }
                    }
                }
            }
        }

        if (!hasPartnerItems) {
            return errorResponse('NOT_FOUND', 'Order not found', 404);
        }


        // Get current order status for history
        const { data: currentOrder } = await supabase
            .from('shop_orders')
            .select('status, payment_status')
            .eq('id', orderId)
            .single();

        // Update order status
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString()
        };
        if (tracking_number) updateData.tracking_numbers = { number: tracking_number, url: tracking_url };

        // If delivered, also update payment_status to paid
        if (status === 'delivered') {
            updateData.payment_status = 'paid';
        }

        const { data: updated, error } = await supabase
            .from('shop_orders')
            .update(updateData)
            .eq('id', orderId)
            .select('id, status, payment_status, updated_at')
            .single();

        if (error || !updated) {
            return errorResponse('INTERNAL_ERROR', 'Failed to update order status', 500);
        }

        // Record in order_status_history
        await supabase.from('order_status_history').insert({
            order_id: orderId,
            old_status: currentOrder?.status || 'pending',
            new_status: status,
            old_payment_status: currentOrder?.payment_status || 'unpaid',
            new_payment_status: status === 'delivered' ? 'paid' : (currentOrder?.payment_status || 'unpaid'),
            changed_by_type: 'partner',
            changed_by_id: userId,
            notes: `Status updated by partner${tracking_number ? ` (tracking: ${tracking_number})` : ''}`
        });

        // Log audit
        await supabase.from('shop_partner_audit_logs').insert({
            partner_id: partner.id,
            actor_id: userId,
            action: 'order_status_update',
            entity_type: 'order',
            entity_id: orderId,
            old_values: { status: currentOrder?.status },
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
