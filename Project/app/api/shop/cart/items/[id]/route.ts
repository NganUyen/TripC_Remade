import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    getOrCreateCart,
    recalculateCart,
    money,
} from '@/lib/shop/utils';
import { shopData } from '@/lib/mock/shop';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const { userId, sessionId } = getAuthInfo(request);

    if (!userId && !sessionId) {
        return errorResponse('UNAUTHORIZED', 'Missing session or auth', 401);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
    }

    const { qty } = body;
    if (!qty || qty < 1) {
        return errorResponse('INVALID_REQUEST', 'qty >= 1 required', 400);
    }

    const cart = getOrCreateCart(sessionId, userId);
    const item = cart.items.find(i => i.id === id);

    if (!item) {
        return errorResponse('CART_ITEM_NOT_FOUND', 'Cart item not found', 404);
    }

    // Check stock
    const variant = shopData.variants.find(v => v.id === item.variant_id);
    if (variant && qty > variant.stock_on_hand) {
        return errorResponse('INSUFFICIENT_STOCK', `Only ${variant.stock_on_hand} in stock`, 409);
    }

    item.qty = qty;
    item.line_total = money(item.unit_price.amount * qty);

    recalculateCart(cart);

    return successResponse(cart);
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const { userId, sessionId } = getAuthInfo(request);

    if (!userId && !sessionId) {
        return errorResponse('UNAUTHORIZED', 'Missing session or auth', 401);
    }

    const cart = getOrCreateCart(sessionId, userId);
    const itemIndex = cart.items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
        return errorResponse('CART_ITEM_NOT_FOUND', 'Cart item not found', 404);
    }

    cart.items.splice(itemIndex, 1);
    recalculateCart(cart);

    return successResponse(cart);
}
