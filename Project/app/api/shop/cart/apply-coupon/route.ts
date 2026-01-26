import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    getOrCreateCart,
    recalculateCart,
    shopData
} from '@/lib/shop/utils';

export async function POST(request: NextRequest) {
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

    const { code } = body;
    if (!code) {
        return errorResponse('INVALID_REQUEST', 'Coupon code required', 400);
    }

    const coupon = shopData.coupons.find(c => c.code === code && c.status === 'active');

    if (!coupon) {
        return errorResponse('COUPON_INVALID', 'Coupon code not found or inactive', 400);
    }

    // Check date validity
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return errorResponse('COUPON_INVALID', 'Coupon not yet active', 400);
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
        return errorResponse('COUPON_EXPIRED', 'Coupon has expired', 400);
    }

    // Check usage limit
    if (coupon.usage_limit_total && coupon.current_usage_count >= coupon.usage_limit_total) {
        return errorResponse('COUPON_LIMIT_REACHED', 'Coupon usage limit reached', 400);
    }

    const cart = getOrCreateCart(sessionId, userId);

    // Check minimum spend
    if (cart.subtotal.amount < coupon.min_order_subtotal) {
        return errorResponse(
            'COUPON_MIN_NOT_MET',
            `Minimum spend of $${(coupon.min_order_subtotal / 100).toFixed(2)} required`,
            400
        );
    }

    cart.coupon_code = code;
    recalculateCart(cart);

    return successResponse(cart);
}
