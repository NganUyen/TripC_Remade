/**
 * Shop Database Queries
 * 
 * INTERFACE LAYER: This file is the single source of truth for data queries.
 * 
 * NOW:   Uses mock data from lib/mock/shop.ts
 * LATER: Swap to Supabase queries (just uncomment & remove mock imports)
 */

import type {
    Product,
    Variant,
    Category,
    Brand,
    Cart,
    Order,
    ShippingMethod,
    VoucherTemplate,
    Address
} from './types';

// =============================================================================
// TOGGLE: Mock vs Supabase
// When ready for production, set USE_MOCK = false and configure Supabase
// =============================================================================

const USE_MOCK = true;

// Mock imports (remove when switching to Supabase)
import { mockQueries, shopMockData } from '../mock/shop';

// Supabase imports (uncomment when ready)
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// =============================================================================
// PRODUCTS
// =============================================================================

export async function getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    brand?: string;
    featured?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}): Promise<{ data: Product[]; total: number }> {
    if (USE_MOCK) {
        return mockQueries.products.findAll(params);
    }

    // Supabase implementation
    // const query = supabase.from('products').select('*', { count: 'exact' }).eq('status', 'active');
    // ... build query based on params
    // return { data: result.data, total: result.count };
    throw new Error('Supabase not configured');
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    if (USE_MOCK) {
        return mockQueries.products.findBySlug(slug) || null;
    }

    throw new Error('Supabase not configured');
}

export async function getProductById(id: string): Promise<Product | null> {
    if (USE_MOCK) {
        return mockQueries.products.findById(id) || null;
    }

    throw new Error('Supabase not configured');
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
    if (USE_MOCK) {
        return mockQueries.products.search(query, limit);
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// VARIANTS
// =============================================================================

export async function getVariantsByProductId(productId: string): Promise<Variant[]> {
    if (USE_MOCK) {
        return mockQueries.variants.findByProductId(productId) as Variant[];
    }

    throw new Error('Supabase not configured');
}

export async function getVariantById(variantId: string): Promise<Variant | null> {
    if (USE_MOCK) {
        return (mockQueries.variants.findById(variantId) as Variant) || null;
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// CATEGORIES & BRANDS
// =============================================================================

export async function getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
        return mockQueries.categories.findAll() as Category[];
    }

    throw new Error('Supabase not configured');
}

export async function getCategoryTree(): Promise<(Category & { children: Category[] })[]> {
    if (USE_MOCK) {
        return mockQueries.categories.getTree();
    }

    throw new Error('Supabase not configured');
}

export async function getBrands(): Promise<Brand[]> {
    if (USE_MOCK) {
        return mockQueries.brands.findAll() as Brand[];
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// IMAGES
// =============================================================================

export async function getProductImages(productId: string) {
    if (USE_MOCK) {
        return mockQueries.images.findByProductId(productId);
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// CART
// =============================================================================

export async function getCart(sessionKey: string): Promise<Cart | null> {
    if (USE_MOCK) {
        return mockQueries.cart.get(sessionKey) || null;
    }

    throw new Error('Supabase not configured');
}

export async function getOrCreateCart(sessionKey: string): Promise<Cart> {
    if (USE_MOCK) {
        return mockQueries.cart.getOrCreate(sessionKey);
    }

    throw new Error('Supabase not configured');
}

export async function addCartItem(
    sessionKey: string,
    variantId: string,
    qty: number
): Promise<Cart> {
    if (USE_MOCK) {
        const cart = mockQueries.cart.getOrCreate(sessionKey);
        const variant = mockQueries.variants.findById(variantId);

        if (!variant) {
            throw new Error('Variant not found');
        }

        // Check if item exists
        const existingItem = cart.items.find(i => i.variant_id === variantId);

        if (existingItem) {
            existingItem.qty += qty;
            existingItem.line_total = {
                amount: existingItem.unit_price.amount * existingItem.qty,
                currency: existingItem.unit_price.currency
            };
        } else {
            const product = mockQueries.products.findById(variant.product_id);
            cart.items.push({
                id: `item-${crypto.randomUUID().slice(0, 8)}`,
                variant_id: variantId,
                qty,
                unit_price: { amount: variant.price, currency: variant.currency },
                line_total: { amount: variant.price * qty, currency: variant.currency },
                title_snapshot: product?.title || variant.title,
                variant_snapshot: variant.options.reduce((acc, opt) => ({ ...acc, [opt.name]: opt.value }), {}),
            });
        }

        mockQueries.cart.recalculate(cart);
        return cart;
    }

    throw new Error('Supabase not configured');
}

export async function updateCartItem(
    sessionKey: string,
    itemId: string,
    qty: number
): Promise<Cart> {
    if (USE_MOCK) {
        const cart = mockQueries.cart.get(sessionKey);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(i => i.id === itemId);
        if (!item) throw new Error('Item not found');

        item.qty = qty;
        item.line_total = { amount: item.unit_price.amount * qty, currency: item.unit_price.currency };

        mockQueries.cart.recalculate(cart);
        return cart;
    }

    throw new Error('Supabase not configured');
}

export async function removeCartItem(
    sessionKey: string,
    itemId: string
): Promise<Cart> {
    if (USE_MOCK) {
        const cart = mockQueries.cart.get(sessionKey);
        if (!cart) throw new Error('Cart not found');

        const index = cart.items.findIndex(i => i.id === itemId);
        if (index > -1) {
            cart.items.splice(index, 1);
        }

        mockQueries.cart.recalculate(cart);
        return cart;
    }

    throw new Error('Supabase not configured');
}

export async function applyCouponToCart(
    sessionKey: string,
    couponCode: string
): Promise<{ cart: Cart; error?: string }> {
    if (USE_MOCK) {
        const cart = mockQueries.cart.get(sessionKey);
        if (!cart) return { cart: mockQueries.cart.getOrCreate(sessionKey), error: 'Cart not found' };

        const coupon = mockQueries.coupons.findByCode(couponCode);
        if (!coupon) return { cart, error: 'Invalid coupon code' };

        if (cart.subtotal.amount < coupon.min_order_subtotal) {
            return { cart, error: `Minimum order of $${coupon.min_order_subtotal / 100} required` };
        }

        cart.coupon_code = couponCode;
        mockQueries.cart.recalculate(cart);
        return { cart };
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// SHIPPING
// =============================================================================

export async function getShippingMethods(): Promise<ShippingMethod[]> {
    if (USE_MOCK) {
        return mockQueries.shippingMethods.findActive() as ShippingMethod[];
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// ADDRESSES
// =============================================================================

export async function getUserAddresses(userId: string): Promise<Address[]> {
    if (USE_MOCK) {
        return mockQueries.addresses.findByUserId(userId);
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// ORDERS
// =============================================================================

export async function createOrder(
    userId: string,
    sessionKey: string,
    shippingAddressId: string,
    shippingMethodId: string
): Promise<Order> {
    if (USE_MOCK) {
        const order = mockQueries.order.create(userId, sessionKey, shippingAddressId, shippingMethodId);
        if (!order) throw new Error('Failed to create order');
        return order;
    }

    throw new Error('Supabase not configured');
}

export async function getOrders(userId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
}): Promise<{ data: Order[]; total: number }> {
    if (USE_MOCK) {
        const orders = mockQueries.order.findByUser(userId);
        return { data: orders, total: orders.length };
    }

    throw new Error('Supabase not configured');
}

export async function getOrderByNumber(userId: string, orderNumber: string): Promise<Order | null> {
    if (USE_MOCK) {
        const order = mockQueries.order.findByNumber(orderNumber);
        if (order && order.user_id === userId) return order;
        return null;
    }

    throw new Error('Supabase not configured');
}

export async function cancelOrder(userId: string, orderId: string): Promise<Order> {
    if (USE_MOCK) {
        const order = mockQueries.order.findById(orderId);
        if (!order) throw new Error('Order not found');
        if (order.user_id !== userId) throw new Error('Unauthorized');
        if (order.status !== 'pending') throw new Error('Only pending orders can be cancelled');

        order.status = 'cancelled';
        order.updated_at = new Date().toISOString();
        return order;
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// VOUCHERS
// =============================================================================

export async function getAvailableVouchers(): Promise<VoucherTemplate[]> {
    if (USE_MOCK) {
        return mockQueries.vouchers.findActive() as VoucherTemplate[];
    }

    throw new Error('Supabase not configured');
}

export async function getUserVouchers(userId: string) {
    if (USE_MOCK) {
        return mockQueries.vouchers.getUserVouchers(userId);
    }

    throw new Error('Supabase not configured');
}

export async function redeemVoucher(userId: string, templateId: string, tcentBalance: number) {
    if (USE_MOCK) {
        return mockQueries.vouchers.redeemVoucher(userId, templateId, tcentBalance);
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// WISHLIST
// =============================================================================

export async function getWishlist(userId: string): Promise<Product[]> {
    if (USE_MOCK) {
        return mockQueries.wishlist.get(userId) as Product[];
    }

    throw new Error('Supabase not configured');
}

export async function addToWishlist(userId: string, productId: string): Promise<string[]> {
    if (USE_MOCK) {
        return mockQueries.wishlist.add(userId, productId);
    }

    throw new Error('Supabase not configured');
}

export async function removeFromWishlist(userId: string, productId: string): Promise<string[]> {
    if (USE_MOCK) {
        return mockQueries.wishlist.remove(userId, productId);
    }

    throw new Error('Supabase not configured');
}

// =============================================================================
// REVIEWS
// =============================================================================

export async function createReview(data: {
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    body?: string;
}) {
    if (USE_MOCK) {
        return mockQueries.reviews.create(data);
    }

    throw new Error('Supabase not configured');
}
