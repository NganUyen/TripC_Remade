import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { createOrder } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    const { userId, sessionId } = await auth();

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in to checkout', 401);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
    }

    const { shipping_address_id, shipping_method_id } = body;

    if (!shipping_address_id || !shipping_method_id) {
        return errorResponse('INVALID_REQUEST', 'shipping_address_id and shipping_method_id required', 400);
    }

    // Use session ID if cart is session-based, but checkout requires user login
    // Ideally cart should be merged to user before checkout
    const key = userId || sessionId;

    try {
        const order = await createOrder(userId, key!, shipping_address_id, shipping_method_id);
        return successResponse(order, { status: 201 });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return errorResponse('CHECKOUT_FAILED', error.message || 'Failed to create order', 500);
    }
}
