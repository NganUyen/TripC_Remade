import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/shop/utils';
import { getOrderByNumber, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

type Params = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    const { number } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
        return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
    }

    try {
        const order = await getOrderByNumber(userId, number);

        if (!order) {
            return errorResponse('ORDER_NOT_FOUND', `Order "${number}" not found`, 404);
        }

        return successResponse(order);
    } catch (error) {
        console.error('Order detail API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch order', 500);
    }
}
