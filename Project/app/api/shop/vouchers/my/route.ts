import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { getUserVouchers, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let vouchers = await getUserVouchers(userId);

        // Filter by status if specified
        if (status) {
            vouchers = vouchers.filter((v: any) => v.status === status);
        }

        // Check for expired vouchers and update status in response
        const now = new Date();
        const formattedVouchers = vouchers.map((v: any) => {
            const isExpired = v.status === 'active' && new Date(v.expires_at) < now;
            return {
                id: v.id,
                template_id: v.template_id,
                status: isExpired ? 'expired' : v.status,
                expires_at: v.expires_at,
                created_at: v.created_at,
                // Include template details if available
                template: v.voucher_templates ? {
                    title: v.voucher_templates.title,
                    description: v.voucher_templates.description,
                    discount_mode: v.voucher_templates.discount_mode,
                    discount_value: v.voucher_templates.discount_value,
                    min_spend_threshold: v.voucher_templates.min_spend_threshold,
                } : null
            };
        });

        return successResponse(formattedVouchers);
    } catch (error) {
        console.error('getUserVouchers error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch user vouchers', 500);
    }
}
