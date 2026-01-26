import { NextRequest } from 'next/server';
import {
    paginatedResponse,
    errorResponse,
    getAuthInfo,
    orders
} from '@/lib/shop/utils';

export async function GET(request: NextRequest) {
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Get all orders (mock: return all)
    let ordersList = Array.from(orders.values())
        .filter((v, i, a) => a.findIndex(o => o.id === v.id) === i); // dedupe

    if (status) {
        ordersList = ordersList.filter(o => o.status === status);
    }

    // Sort by created_at desc
    ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = ordersList.length;
    const paginated = ordersList.slice(offset, offset + limit);

    const summaries = paginated.map(o => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        payment_status: o.payment_status,
        grand_total: o.grand_total,
        item_count: o.items.length,
        created_at: o.created_at,
    }));

    return paginatedResponse(summaries, total, limit, offset);
}
