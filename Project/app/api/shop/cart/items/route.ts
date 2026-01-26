import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    addCartItem,
    getVariantById,
} from '@/lib/shop';

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionId } = getAuthInfo(request);
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

        const { variant_id, qty } = body;

        if (!variant_id || !qty || qty < 1) {
            return errorResponse('INVALID_REQUEST', 'variant_id and qty >= 1 required', 400);
        }

        // Check variant exists and has stock
        const variant = await getVariantById(variant_id);
        if (!variant) {
            return errorResponse('VARIANT_NOT_FOUND', 'Variant not found', 404);
        }

        if (variant.stock_on_hand < qty) {
            return errorResponse('INSUFFICIENT_STOCK', `Only ${variant.stock_on_hand} in stock`, 409);
        }

        // Add to cart using queries interface
        const cart = await addCartItem(key, variant_id, qty);
        return successResponse(cart, undefined, 201);
    } catch (error) {
        console.error('Cart POST error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to add item to cart', 500);
    }
}
