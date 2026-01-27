import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { createOrder, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in to checkout', 401);
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

        const { shipping_address_id, shipping_method_id } = body;

        if (!shipping_address_id || !shipping_method_id) {
            return errorResponse('INVALID_REQUEST', 'shipping_address_id and shipping_method_id required', 400);
        }

        const order = await createOrder(userId, userId, shipping_address_id, shipping_method_id);
        return successResponse(order, { status: 201 });
    } catch (error: any) {
        console.error('Checkout error:', error);
        
        // Handle specific error types
        if (error.message.includes('Cart is empty')) {
            return errorResponse('EMPTY_CART', 'Cart is empty', 400);
        }
        if (error.message.includes('Insufficient stock')) {
            return errorResponse('INSUFFICIENT_STOCK', error.message, 409);
        }
        if (error.message.includes('Invalid shipping')) {
            return errorResponse('INVALID_SHIPPING', error.message, 400);
        }
        
        return errorResponse('CHECKOUT_FAILED', error.message || 'Failed to create order', 500);
    }
}
