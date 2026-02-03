import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';
import { resolveUserUuid } from '../utils';

export class ShopSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[SHOP_SETTLEMENT_HANDLER] Starting', { bookingId: booking.id });

        // 1. Idempotency Check: Check if order already exists
        const { data: existingOrder } = await this.supabase
            .from('shop_orders')
            .select('id, order_number')
            .eq('booking_id', booking.id)
            .maybeSingle();

        if (existingOrder) {
            console.log('[SHOP_SETTLEMENT] Idempotent: Order already exists');
            return; // Already settled
        }

        // 2. Determine mode: Cart checkout vs Buy Now
        const isBuyNow = booking.metadata?.isBuyNow === true;
        const cartId = booking.metadata?.cartId;

        console.log('[SHOP_SETTLEMENT_HANDLER] Mode:', isBuyNow ? 'BUY_NOW' : 'CART', { cartId, isBuyNow });

        let orderItems: any[] = [];

        if (isBuyNow) {
            // Buy Now mode: Items are in booking.metadata.items
            const items = booking.metadata?.items;
            if (!items || items.length === 0) {
                console.error('[SHOP_SETTLEMENT_HANDLER] Missing items in Buy Now metadata', { bookingId: booking.id });
                throw new Error('Missing items in Buy Now booking metadata');
            }

            console.log('[SHOP_SETTLEMENT_HANDLER] Buy Now items:', items);

            // Fetch variant details for each item
            for (const item of items) {
                const { data: variant, error: variantError } = await this.supabase
                    .from('product_variants')
                    .select(`
                        id,
                        sku,
                        title,
                        price,
                        product_id,
                        product:shop_products (
                            id,
                            title,
                            product_type
                        )
                    `)
                    .eq('id', item.variantId)
                    .single();

                if (variantError || !variant) {
                    console.error('[SHOP_SETTLEMENT_HANDLER] Variant not found', { variantId: item.variantId });
                    throw new Error(`Variant ${item.variantId} not found`);
                }

                // Build order item structure (same as cart items)
                orderItems.push({
                    variant_id: item.variantId,
                    qty: item.quantity,
                    unit_price: item.price, // Price in cents from Buy Now
                    currency: 'USD',
                    title_snapshot: item.name || variant.product?.title,
                    image_url_snapshot: item.image || null,
                    variant: variant, // Include variant data for stock decrement
                });
            }
        } else {
            // Cart mode: Use items snapshot from metadata if available, otherwise fetch from database
            const cartItemsSnapshot = booking.metadata?.cartItemsSnapshot;

            if (cartItemsSnapshot && Array.isArray(cartItemsSnapshot) && cartItemsSnapshot.length > 0) {
                // Use pre-fetched snapshot from booking creation
                console.log('[SHOP_SETTLEMENT_HANDLER] Using cart items snapshot from metadata', {
                    count: cartItemsSnapshot.length
                });
                orderItems = cartItemsSnapshot;
            } else {
                // Fallback: Fetch items from cart_items table (legacy or if snapshot failed)
                if (!cartId) {
                    console.error('[SHOP_SETTLEMENT_HANDLER] Missing cartId and no items snapshot', {
                        bookingId: booking.id
                    });
                    throw new Error('Missing cartId and cart items snapshot in booking metadata');
                }

                console.log('[SHOP_SETTLEMENT_HANDLER] No items snapshot, fetching from database...', { cartId });

                const { data: cartItems, error: cartError } = await this.supabase
                    .from('cart_items')
                    .select(`
                        *,
                        variant:product_variants (
                            id,
                            sku,
                            title,
                            price,
                            product_id,
                            product:shop_products (
                                id,
                                title,
                                product_type
                            )
                        )
                    `)
                    .eq('cart_id', cartId);

                if (cartError || !cartItems || cartItems.length === 0) {
                    console.error('[SHOP_SETTLEMENT_HANDLER] Cart empty or error', {
                        bookingId: booking.id,
                        cartId,
                        error: cartError?.message,
                        hint: 'Cart items may have been cleared before settlement. Ensure cart items snapshot is saved in booking metadata.'
                    });
                    throw new Error('Cart items not found or empty during settlement. The cart may have been cleared prematurely.');
                }

                orderItems = cartItems;
                console.log('[SHOP_SETTLEMENT_HANDLER] Fetched cart items from database', { count: cartItems.length });
            }
        }

        console.log('[SHOP_SETTLEMENT_HANDLER] Processing items:', { count: orderItems.length });

        // 3. Create Shop Order
        const orderNumber = `ORD-${Date.now()}`;
        const userUuid = await resolveUserUuid(this.supabase, booking.user_id);

        console.log('[SHOP_SETTLEMENT] Resolved internal UUID:', userUuid || 'GUEST');

        const { data: order, error: orderError } = await this.supabase
            .from('shop_orders')
            .insert({
                order_number: orderNumber,
                user_id: userUuid,
                cart_id: cartId || null, // Null for Buy Now
                booking_id: booking.id,
                subtotal: Math.floor(Number(booking.total_amount)),
                shipping_address_snapshot: booking.guest_details?.address || {}, // Fallback
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error('[SHOP_SETTLEMENT_HANDLER] Failed to create order', { error: orderError });
            throw orderError;
        }

        console.log('[SHOP_SETTLEMENT_HANDLER] Order Created', { orderId: order.id, orderNumber });

        // 4. Create Order Items
        const orderItemsData = orderItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.variant?.product_id || item.variant?.product?.id,
            variant_id: item.variant_id,
            title_snapshot: item.title_snapshot || item.variant?.product?.title || 'Unknown Product',
            sku_snapshot: item.variant?.sku,
            image_url_snapshot: item.image_url_snapshot || null,
            qty: item.qty,
            unit_price: item.unit_price,
            line_total: item.qty * item.unit_price,
            currency: item.currency || 'USD'
        }));

        const { error: itemsError } = await this.supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) {
            console.error('[SHOP_SETTLEMENT_HANDLER] Failed to create items', { error: itemsError });
            // In a real transation we would rollback order.
            // Here we might leave a partial order.
            // But since idempotency check relies on Order Existence, retrying might skip items!
            // FIX: We should delete the order if items fail, to allow retry.
            await this.supabase.from('shop_orders').delete().eq('id', order.id);
            throw itemsError;
        }

        console.log('[SHOP_SETTLEMENT_HANDLER] Order Items Created');

        // 5. Update Stock (Decrement)
        // This should be done carefully.
        // We'll loop or use an RPC if available. Loop for now.
        for (const item of orderItems) {
            // Guard negative stock? DB constraints might handle it, or we allow negative for now.
            // 'stock_on_hand' check constraint >= 0 usually.
            const { error: stockError } = await this.supabase.rpc('decrement_stock', {
                p_variant_id: item.variant_id,
                p_qty: item.qty
            });

            // If RPC doesn't exist, we do manual update (race condition prone but acceptable for now)
            if (stockError && stockError.message.includes('function "decrement_stock" does not exist')) {
                // Fallback: Fetch current stock and update
                console.warn('[SHOP_SETTLEMENT_HANDLER] RPC not found, using fallback stock decrement', { variant: item.variant_id });

                const { data: currentVariant } = await this.supabase
                    .from('product_variants')
                    .select('stock_on_hand')
                    .eq('id', item.variant_id)
                    .single();

                if (currentVariant) {
                    const newStock = Math.max(0, currentVariant.stock_on_hand - item.qty);
                    await this.supabase
                        .from('product_variants')
                        .update({
                            stock_on_hand: newStock,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', item.variant_id);

                    console.log('[SHOP_SETTLEMENT_HANDLER] Stock decremented manually', {
                        variant: item.variant_id,
                        oldStock: currentVariant.stock_on_hand,
                        newStock
                    });
                }
            } else if (stockError) {
                console.error('[SHOP_SETTLEMENT_HANDLER] Stock decrement failed', stockError);
            } else {
                console.log('[SHOP_SETTLEMENT_HANDLER] Stock decremented via RPC', { variant: item.variant_id, qty: item.qty });
            }
        }

        // 6. Clear Cart (only for cart mode)
        if (!isBuyNow && cartId) {
            const { error: clearCartError } = await this.supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cartId);

            if (clearCartError) {
                console.error('[SHOP_SETTLEMENT_HANDLER] Failed to clear cart', clearCartError);
            } else {
                console.log('[SHOP_SETTLEMENT_HANDLER] Cart Cleared');
            }
        } else {
            console.log('[SHOP_SETTLEMENT_HANDLER] Skipping cart clear (Buy Now mode)');
        }

        // 7. Consume Voucher (if any)
        const couponCode = booking.metadata?.couponCode;
        if (couponCode) {
            console.log('[SHOP_SETTLEMENT_HANDLER] Consuming voucher:', couponCode);
            try {
                // Find voucher ID
                const { data: voucher } = await this.supabase
                    .from('vouchers')
                    .select('id')
                    .eq('code', couponCode)
                    .single();

                if (voucher) {
                    // Mark as used
                    const { error: voucherError } = await this.supabase
                        .from('user_vouchers')
                        .update({
                            status: 'used',
                            used_at: new Date().toISOString()
                        })
                        .eq('user_id', booking.user_id)
                        .eq('voucher_id', voucher.id)
                        .eq('status', 'active'); // Safety check

                    if (voucherError) {
                        console.error('[SHOP_SETTLEMENT_HANDLER] Failed to mark voucher used', voucherError);
                    } else {
                        console.log('[SHOP_SETTLEMENT_HANDLER] Voucher marked as used');
                    }
                }
            } catch (err) {
                console.error('[SHOP_SETTLEMENT_HANDLER] Voucher consumption error', err);
            }
        }

        // 8. Success
        console.log('[SHOP_SETTLEMENT] Successfully completed shop settlement');
    }
}
