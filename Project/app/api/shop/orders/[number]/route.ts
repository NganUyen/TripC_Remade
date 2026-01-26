import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthInfo, orders } from '@/lib/shop/utils';

type Params = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    const { number } = await params;

    // FIX: Check auth FIRST before checking order existence
    const { userId } = getAuthInfo(request);
    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    // Now check if order exists
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
        return errorResponse('ORDER_NOT_FOUND', `Order "${number}" not found`, 404);
    }

    return successResponse(order);
}
