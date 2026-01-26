/**
 * Shop Mock Data & In-Memory Stores
 * 
 * This file contains mock data and in-memory stores for the shop module.
 * IN PRODUCTION: Replace with Supabase queries in lib/shop/queries.ts
 */

import type {
    ShopMockData,
    Cart,
    CartItem,
    Order,
    Money
} from '../shop/types';
import shopDataJson from './shop-data.json';

// ============================================================================
// STATIC DATA (from JSON)
// ============================================================================

export const shopMockData: ShopMockData = shopDataJson as ShopMockData;

// Alias for backward compatibility  
export const shopData = shopMockData;

// ============================================================================
// IN-MEMORY STORES (Mutable Runtime Data)
// ============================================================================

// Cart storage: key = sessionId or userId
export const carts: Map<string, Cart> = new Map();

// Order storage: key = orderId or orderNumber
export const orders: Map<string, Order> = new Map();

// Wishlist storage: key = userId, value = productIds[]
export const wishlists: Map<string, string[]> = new Map();

// User vouchers: key = userId, value = UserVoucher[]
export const userVouchers: Map<string, any[]> = new Map();

// Coupon usages: key = `${userId}:${couponCode}`, value = usage count
export const couponUsages: Map<string, number> = new Map();

// Reviews storage
export const reviews: any[] = [];

// Order sequence for generating order numbers
let orderSequence = 100000;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function money(amount: number, currency = 'USD'): Money {
    return { amount, currency };
}

export function generateOrderNumber(): string {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const seq = String(++orderSequence).padStart(6, '0');
    return `TC-${yy}${mm}${dd}-${seq}`;
}

// ============================================================================
// MOCK QUERIES - Product Catalog
// ============================================================================

export const mockQueries = {
    // Products
    products: {
        findAll: (params?: { limit?: number; offset?: number; category?: string; brand?: string; featured?: boolean }) => {
            let products = shopMockData.products.filter(p => p.status === 'active');

            if (params?.category) {
                const cat = shopMockData.categories.find(c => c.slug === params.category);
                if (cat) products = products.filter(p => p.category_id === cat.id);
            }
            if (params?.brand) {
                const br = shopMockData.brands.find(b => b.slug === params.brand);
                if (br) products = products.filter(p => p.brand_id === br.id);
            }
            if (params?.featured !== undefined) {
                products = products.filter(p => p.is_featured === params.featured);
            }

            const total = products.length;
            const offset = params?.offset || 0;
            const limit = params?.limit || 20;

            return {
                data: products.slice(offset, offset + limit),
                total
            };
        },
        findBySlug: (slug: string) => shopMockData.products.find(p => p.slug === slug && p.status === 'active'),
        findById: (id: string) => shopMockData.products.find(p => p.id === id),
        search: (query: string, limit = 20) => {
            const q = query.toLowerCase();
            return shopMockData.products
                .filter(p => p.status === 'active' && (
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.slug.includes(q)
                ))
                .slice(0, limit);
        },
    },

    // Variants
    variants: {
        findByProductId: (productId: string) =>
            shopMockData.variants.filter(v => v.product_id === productId && v.is_active),
        findById: (id: string) =>
            shopMockData.variants.find(v => v.id === id),
    },

    // Categories (with hierarchy)
    categories: {
        findAll: () => shopMockData.categories.filter(c => c.is_active),
        findBySlug: (slug: string) => shopMockData.categories.find(c => c.slug === slug),
        getTree: () => {
            const cats = shopMockData.categories.filter(c => c.is_active);
            const roots = cats.filter(c => !c.parent_id);
            return roots.map(root => ({
                ...root,
                children: cats.filter(c => c.parent_id === root.id)
            }));
        },
    },

    // Brands
    brands: {
        findAll: () => shopMockData.brands.filter(b => b.is_active),
        findBySlug: (slug: string) => shopMockData.brands.find(b => b.slug === slug),
    },

    // Images
    images: {
        findByProductId: (productId: string) =>
            shopMockData.images.filter(i => i.product_id === productId).sort((a, b) => a.sort_order - b.sort_order),
    },

    // Shipping
    shippingMethods: {
        findActive: () => shopMockData.shipping_methods.filter(m => m.is_active),
    },

    // Coupons
    coupons: {
        findByCode: (code: string) => {
            const coupon = shopMockData.coupons.find(c => c.code === code && c.status === 'active');
            if (!coupon) return null;

            // Check date validity
            const now = new Date();
            if (coupon.starts_at && new Date(coupon.starts_at) > now) return null;
            if (coupon.ends_at && new Date(coupon.ends_at) < now) return null;

            return coupon;
        },
        checkUsage: (userId: string, code: string) => {
            const key = `${userId}:${code}`;
            return couponUsages.get(key) || 0;
        },
        recordUsage: (userId: string, code: string) => {
            const key = `${userId}:${code}`;
            const current = couponUsages.get(key) || 0;
            couponUsages.set(key, current + 1);
        },
    },

    // Vouchers
    vouchers: {
        findActive: () => shopMockData.voucher_templates.filter(v => v.is_active),
        getUserVouchers: (userId: string) => userVouchers.get(userId) || [],
        redeemVoucher: (userId: string, templateId: string, tcentBalance: number) => {
            const template = shopMockData.voucher_templates.find(v => v.id === templateId && v.is_active);
            if (!template) return { error: 'VOUCHER_NOT_FOUND' };
            if (tcentBalance < template.tcent_cost) return { error: 'INSUFFICIENT_TCENT' };
            if (template.redeemed_count >= template.total_inventory) return { error: 'VOUCHER_SOLD_OUT' };

            const voucher = {
                id: `uv-${crypto.randomUUID().slice(0, 8)}`,
                template_id: templateId,
                user_id: userId,
                status: 'active',
                expires_at: new Date(Date.now() + template.validity_days * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
            };

            const userVoucherList = userVouchers.get(userId) || [];
            userVoucherList.push(voucher);
            userVouchers.set(userId, userVoucherList);

            return { data: voucher, tcent_deducted: template.tcent_cost };
        },
    },

    // Addresses
    addresses: {
        findByUserId: (userId: string) =>
            (shopMockData as any).addresses?.filter((a: any) => a.user_id === userId) || [],
        findById: (addressId: string) =>
            (shopMockData as any).addresses?.find((a: any) => a.id === addressId),
    },

    // Cart operations
    cart: {
        get: (key: string) => carts.get(key),
        create: (key: string): Cart => {
            const cart: Cart = {
                id: `cart-${crypto.randomUUID().slice(0, 8)}`,
                status: 'active',
                currency: 'USD',
                items: [],
                subtotal: money(0),
                discount_total: money(0),
                shipping_total: money(0),
                grand_total: money(0),
                item_count: 0,
                coupon_code: null,
            };
            carts.set(key, cart);
            return cart;
        },
        getOrCreate: (key: string): Cart => {
            if (!carts.has(key)) {
                return mockQueries.cart.create(key);
            }
            return carts.get(key)!;
        },
        recalculate: (cart: Cart) => {
            const subtotal = cart.items.reduce((sum, item) => sum + item.line_total.amount, 0);
            cart.subtotal = money(subtotal);
            cart.item_count = cart.items.reduce((sum, item) => sum + item.qty, 0);

            // Apply discount if coupon
            let discount = 0;
            if (cart.coupon_code) {
                const coupon = mockQueries.coupons.findByCode(cart.coupon_code);
                if (coupon && subtotal >= coupon.min_order_subtotal) {
                    if (coupon.discount_type === 'percent') {
                        discount = Math.round(subtotal * (coupon.discount_value / 100));
                    } else {
                        discount = coupon.discount_value;
                    }
                }
            }
            cart.discount_total = money(discount);
            cart.grand_total = money(subtotal - discount + cart.shipping_total.amount);
        },
    },

    // Order operations
    order: {
        create: (userId: string, cartKey: string, shippingAddressId: string, shippingMethodId: string): Order | null => {
            const cart = carts.get(cartKey);
            if (!cart || cart.items.length === 0) return null;

            const shippingMethod = shopMockData.shipping_methods.find(m => m.id === shippingMethodId);
            if (!shippingMethod) return null;

            const orderNumber = generateOrderNumber();
            const now = new Date().toISOString();

            const order: Order = {
                id: `order-${crypto.randomUUID().slice(0, 8)}`,
                order_number: orderNumber,
                user_id: userId,
                status: 'pending',
                payment_status: 'pending',
                currency: cart.currency,
                subtotal: cart.subtotal,
                discount_total: cart.discount_total,
                shipping_total: money(shippingMethod.base_fee, 'USD'),
                grand_total: money(cart.subtotal.amount - cart.discount_total.amount + shippingMethod.base_fee),
                items: cart.items.map(item => ({
                    ...item,
                    id: `oi-${crypto.randomUUID().slice(0, 8)}`,
                })),
                shipping_address_id: shippingAddressId,
                shipping_method_id: shippingMethodId,
                created_at: now,
                updated_at: now,
            };

            orders.set(order.id, order);
            orders.set(orderNumber, order);

            // Mark cart as converted
            cart.status = 'converted';

            return order;
        },
        findByUser: (userId: string) => {
            const result: Order[] = [];
            for (const order of orders.values()) {
                if (order.user_id === userId) result.push(order);
            }
            return result;
        },
        findByNumber: (orderNumber: string) => orders.get(orderNumber),
        findById: (orderId: string) => orders.get(orderId),
    },

    // Wishlist operations
    wishlist: {
        get: (userId: string) => {
            const productIds = wishlists.get(userId) || [];
            return productIds.map(id => shopMockData.products.find(p => p.id === id)).filter(Boolean);
        },
        add: (userId: string, productId: string) => {
            const list = wishlists.get(userId) || [];
            if (!list.includes(productId)) {
                list.push(productId);
                wishlists.set(userId, list);
            }
            return list;
        },
        remove: (userId: string, productId: string) => {
            const list = wishlists.get(userId) || [];
            const index = list.indexOf(productId);
            if (index > -1) {
                list.splice(index, 1);
                wishlists.set(userId, list);
            }
            return list;
        },
        has: (userId: string, productId: string) => {
            const list = wishlists.get(userId) || [];
            return list.includes(productId);
        },
    },

    // Reviews
    reviews: {
        create: (data: { userId: string; productId: string; rating: number; title?: string; body?: string }) => {
            const review = {
                id: `review-${crypto.randomUUID().slice(0, 8)}`,
                user_id: data.userId,
                product_id: data.productId,
                rating: data.rating,
                title: data.title || '',
                body: data.body || '',
                status: 'pending', // Needs moderation
                created_at: new Date().toISOString(),
            };
            reviews.push(review);
            return review;
        },
        findByProduct: (productId: string) => reviews.filter(r => r.product_id === productId && r.status === 'approved'),
    },
};

export default shopMockData;
