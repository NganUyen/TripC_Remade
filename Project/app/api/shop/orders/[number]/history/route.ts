import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthInfo, orders } from '@/lib/shop/utils';

type Params = { params: Promise<{ number: string }> };

// In-memory history store
const orderHistory: Map<string, any[]> = new Map();

export async function GET(request: NextRequest, { params }: Params) {
    const { number } = await params;
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    // Find order by number or id
    let order = orders.get(number);
    if (!order) {
        for (const o of orders.values()) {
            if (o.id === number || o.order_number === number) {
                order = o;
                break;
            }
        }
    }

    if (!order) {
        return errorResponse('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // Return mock history - use order.id as key
    const history = orderHistory.get(order.id) || [
        {
            id: `hist-${crypto.randomUUID().slice(0, 8)}`,
            old_status: null,
            new_status: 'pending',
            old_payment_status: null,
            new_payment_status: 'pending',
            changed_by_type: 'system',
            notes: 'Order created',
            created_at: order.created_at,
        }
    ];

    return successResponse(history);
}
