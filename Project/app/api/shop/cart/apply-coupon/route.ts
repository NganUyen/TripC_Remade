import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { applyCouponToCart } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    const { userId, sessionId } = await auth();
    const key = userId || sessionId;

    if (!key) {
        return errorResponse('UNAUTHORIZED', 'Missing session or auth', 401);
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

    try {
        const { cart, error } = await applyCouponToCart(key, code);

        if (error) {
            return errorResponse('COUPON_ERROR', error, 400);
        }

        return successResponse(cart);
    } catch (error) {
        console.error('Apply coupon error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to apply coupon', 500);
    }
}
