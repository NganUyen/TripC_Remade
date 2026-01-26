import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthInfo, orders } from '@/lib/shop/utils';

type Params = { params: Promise<{ number: string }> };

export async function POST(request: NextRequest, { params }: Params) {
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

    if (order.status !== 'pending') {
        return errorResponse(
            'ORDER_CANNOT_CANCEL',
            `Cannot cancel order with status "${order.status}"`,
            400
        );
    }

    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();

    return successResponse(order);
}
