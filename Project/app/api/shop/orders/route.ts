import { NextRequest } from 'next/server';
import {
    paginatedResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { getOrders } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;

    try {
        const { data: orders, total } = await getOrders(userId, {
            limit,
            offset,
            status,
        });

        // Format summaries
        const summaries = orders.map(o => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            payment_status: o.payment_status,
            grand_total: o.grand_total,
            item_count: o.items?.length || 0,
            created_at: o.created_at,
        }));

        return paginatedResponse(summaries, total, limit, offset);
    } catch (error) {
        console.error('Orders API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch orders', 500);
    }
}
