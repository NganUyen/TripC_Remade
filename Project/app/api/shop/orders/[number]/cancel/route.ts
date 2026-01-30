import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/shop/utils';
import { cancelOrder, getDbUserId, getOrderByNumber } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

type Params = { params: Promise<{ number: string }> };

export async function POST(request: NextRequest, { params }: Params) {
    const { number } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
        return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
    }

    try {
        const order = await getOrderByNumber(userId, number);

        if (!order) {
            return errorResponse('ORDER_NOT_FOUND', 'Order not found', 404);
        }

        const cancelledOrder = await cancelOrder(userId, order.id);
        return successResponse(cancelledOrder);
    } catch (error: any) {
        return errorResponse('CANCEL_FAILED', error.message || 'Failed to cancel order', 400);
    }
}
