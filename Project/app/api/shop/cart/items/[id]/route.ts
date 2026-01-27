import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    updateCartItem,
    removeCartItem,
    getVariantById,
    getCart
} from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return errorResponse('UNAUTHORIZED', 'Missing auth', 401);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const { qty } = body;
        if (typeof qty !== 'number') {
            return errorResponse('INVALID_REQUEST', 'qty is required', 400);
        }

        // Validate stock if increasing
        // Get the item first to find variant_id.
        const cart = await getCart(userId);
        const item = cart?.items.find(i => i.id === params.id);

        if (!item) {
            return errorResponse('ITEM_NOT_FOUND', 'Item not found in cart', 404);
        }

        if (qty > 0) {
            const variant = await getVariantById(item.variant_id);
            if (variant && variant.stock_on_hand < qty) {
                return errorResponse('INSUFFICIENT_STOCK', `Only ${variant.stock_on_hand} in stock`, 409);
            }
        }

        const updatedCart = await updateCartItem(userId, params.id, qty);
        return successResponse(updatedCart);

    } catch (error) {
        console.error('Cart Item PATCH error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to update item', 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return errorResponse('UNAUTHORIZED', 'Missing auth', 401);
        }

        const updatedCart = await removeCartItem(userId, params.id);
        return successResponse(updatedCart);

    } catch (error) {
        console.error('Cart Item DELETE error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to remove item', 500);
    }
}
