import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { applyCouponToCart, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const { code } = body;
        if (!code) {
            return errorResponse('INVALID_REQUEST', 'Coupon code required', 400);
        }

        const { cart, error } = await applyCouponToCart(userId, code);

        if (error) {
            return errorResponse('COUPON_ERROR', error, 400);
        }

        return successResponse(cart);
    } catch (error) {
        console.error('Apply coupon error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to apply coupon', 500);
    }
}
