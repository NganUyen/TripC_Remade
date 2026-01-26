import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    getOrCreateCart,
    generateOrderNumber,
    money,
    shopData,
    orders
} from '@/lib/shop/utils';

export async function POST(request: NextRequest) {
    const { userId, sessionId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in to checkout', 401);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
    }

    const { shipping_address_id, shipping_method_id, voucher_code, customer_notes } = body;

    if (!shipping_address_id || !shipping_method_id) {
        return errorResponse('INVALID_REQUEST', 'shipping_address_id and shipping_method_id required', 400);
    }

    const cart = getOrCreateCart(sessionId, userId);

    if (cart.items.length === 0) {
        return errorResponse('CART_EMPTY', 'Cannot checkout an empty cart', 409);
    }

    // Find shipping method
    const shippingMethod = shopData.shipping_methods.find(m => m.id === shipping_method_id);
    if (!shippingMethod) {
        return errorResponse('SHIPPING_METHOD_NOT_FOUND', 'Shipping method not found', 400);
    }

    // Mock address (in real impl, fetch from DB)
    const shippingAddress = {
        id: shipping_address_id,
        full_name: 'Mock User',
        phone: '+1234567890',
        country: 'United States',
        city: 'New York',
        line1: '123 Main St',
        postal_code: '10001',
        is_default: true,
    };

    // Calculate totals
    const subtotal = cart.subtotal.amount;
    const discountTotal = cart.discount_total.amount;
    const shippingTotal = shippingMethod.base_fee;
    const grandTotal = subtotal - discountTotal + shippingTotal;

    const orderId = `order-${crypto.randomUUID().slice(0, 8)}`;
    const orderNumber = generateOrderNumber();

    const order = {
        id: orderId,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        currency: 'USD',
        subtotal: money(subtotal),
        discount_total: money(discountTotal),
        shipping_total: money(shippingTotal),
        grand_total: money(grandTotal),
        tcent_earned: Math.floor(grandTotal / 100), // 1 tcent per $1
        tcent_used: 0,
        shipping_address: shippingAddress,
        shipping_method: {
            id: shippingMethod.id,
            code: shippingMethod.code,
            title: shippingMethod.title,
            base_fee: money(shippingMethod.base_fee),
        },
        items: cart.items.map(item => ({
            id: `oi-${crypto.randomUUID().slice(0, 8)}`,
            title_snapshot: item.title_snapshot,
            sku_snapshot: '',
            image_url_snapshot: null,
            qty: item.qty,
            unit_price: item.unit_price,
            line_total: item.line_total,
        })),
        tracking_numbers: [],
        customer_notes: customer_notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Store order
    orders.set(orderNumber, order);
    orders.set(orderId, order);

    // Clear cart
    cart.items = [];
    cart.status = 'converted';
    cart.coupon_code = null;

    return successResponse(order, { status: 201 });
}
