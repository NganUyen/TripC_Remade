/**
 * Shop Database Queries
 * 
 * INTERFACE LAYER: This file is the single source of truth for data queries.
 * Uses Supabase for all database operations.
 */

import type {
    Product,
    Variant,
    Category,
    Brand,
    Cart,
    CartItem,
    Order,
    ShippingMethod,
    VoucherTemplate,
    Address,
    Money,
    Review
} from './types';

import { createServiceSupabaseClient } from '../supabase-server';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function money(amount: number, currency = 'USD'): Money {
    return { amount, currency };
}

function getSupabase() {
    return createServiceSupabaseClient();
}

/**
 * Resolves Clerk ID (string) to Database UUID
 */
export async function getDbUserId(clerkId: string): Promise<string | null> {
    const supabase = getSupabase();
    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();
    return data?.id || null;
}

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
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    let query = supabase
        .from('shop_products')
        .select('*, variants:product_variants(*), images:product_images(*), category:categories(*)', { count: 'exact' })
        .eq('status', 'active');

    // Filter by category slug
    if (params?.category) {
        // We can use !inner join to filter by related table if we want, but for now stick to ID lookup or join
        // Using two steps or inner join is cleaner. Given current implementation does ID lookup first:
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', params.category)
            .single();
        if (cat) query = query.eq('category_id', cat.id);
    }

    // Filter by brand slug
    if (params?.brand) {
        const { data: br } = await supabase
            .from('brands')
            .select('id')
            .eq('slug', params.brand)
            .single();
        if (br) query = query.eq('brand_id', br.id);
    }

    // Filter featured
    if (params?.featured !== undefined) {
        query = query.eq('is_featured', params.featured);
    }

    // Sorting
    switch (params?.sort) {
        case 'price_asc':
            // We can't easily sort by related column in one simple query without complex ordering logic or RPC
            // For MVP, we sort in memory or stick to created_at
            query = query.order('created_at', { ascending: false });
            break;
        case 'price_desc':
            // query = query.order('created_at', { ascending: false });
            query = query.order('created_at', { ascending: false });
            break;
        case 'rating':
            query = query.order('rating_avg', { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error('getProducts error:', error);
        return { data: [], total: 0 };
    }

    // Map data to ensure types match (Supabase returns relations as arrays/objects)
    const formattedData = (data || []).map((p: any) => ({
        ...p,
        variants: p.variants || [],
        images: p.images || [],
        category: p.category // might be object or null
    }));

    return {
        data: formattedData as Product[],
        total: count || 0
    };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (error || !data) return null;
    return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data as Product;
}

export async function searchProducts(
    query: string,
    params?: {
        minPrice?: number;
        maxPrice?: number;
        category?: string;
        sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
        limit?: number;
        offset?: number;
    }
): Promise<{ data: Product[]; total: number }> {
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    // Base query
    let dbQuery = supabase
        .from('shop_products')
        .select('*, shop_categories!inner(slug)', { count: 'exact' })
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    // Category Filter
    if (params?.category) {
        dbQuery = dbQuery.eq('shop_categories.slug', params.category);
    }

    // Apply filters & sort
    // Note: Price filtering requires joining variants, which is complex in single query. 
    // For MVP, we'll fetch variants and filter in memory if needed, or use a view.
    // However, basic sorting on product level (e.g. created_at, rating) works fine.

    switch (params?.sort) {
        case 'newest':
            dbQuery = dbQuery.order('created_at', { ascending: false });
            break;
        case 'rating':
            dbQuery = dbQuery.order('rating_avg', { ascending: false });
            break;
        case 'relevance':
        default:
            // Default text search rank isn't exposed easily via simple JS client without RPC
            // So we default to rating or created_at as fallback for "relevance"
            dbQuery = dbQuery.order('rating_avg', { ascending: false });
    }

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, count, error } = await dbQuery;

    if (error) {
        console.error('searchProducts error:', error);
        return { data: [], total: 0 };
    }

    let products = (data || []) as any[];

    // If Price Filter is needed, we might need a second step to filter by variants
    // But since we want to return Products, we can just return them for now.
    // Enhancing with variants for frontend display:

    // Type casting
    const result = products.map(p => ({
        ...p,
        category: p.shop_categories // Map relation back if needed
    })) as Product[];

    return {
        data: result,
        total: count || 0
    };
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<(Product & { images: any[]; variants: any[] })[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_products')
        .select('id, title, slug, rating_avg, shop_categories(name)')
        .eq('status', 'active')
        .ilike('title', `%${query}%`)
        .limit(limit);

    if (error) return [];

    // We need to fetch one image and min price for the suggestion to look good
    const suggestions = await Promise.all(data.map(async (p: any) => {
        const [images, variants] = await Promise.all([
            getProductImages(p.id),
            getVariantsByProductId(p.id)
        ]);

        const price = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;

        return {
            ...p,
            variants: variants,
            images: images,
            price_from: { amount: price, currency: 'USD' }
        };
    }));

    return suggestions as (Product & { images: any[]; variants: any[] })[];
}

// =============================================================================
// VARIANTS
// =============================================================================

export async function getVariantsByProductId(productId: string): Promise<Variant[]> {
    const supabase = getSupabase();

    const { data: variants, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);

    if (error || !variants) return [];

    // Get variant options
    const variantIds = variants.map(v => v.id);
    const { data: options } = await supabase
        .from('variant_options')
        .select('*')
        .in('variant_id', variantIds);

    return variants.map(v => ({
        id: v.id,
        product_id: v.product_id,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price,
        currency: v.currency || 'USD',
        stock_on_hand: v.stock_on_hand,
        is_active: v.is_active,
        options: (options || [])
            .filter(o => o.variant_id === v.id)
            .map(o => ({ name: o.name, value: o.value }))
    })) as Variant[];
}

export async function getVariantById(variantId: string): Promise<Variant | null> {
    const supabase = getSupabase();

    const { data: v, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('id', variantId)
        .single();

    if (error || !v) return null;

    const { data: options } = await supabase
        .from('variant_options')
        .select('*')
        .eq('variant_id', variantId);

    return {
        id: v.id,
        product_id: v.product_id,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price,
        currency: v.currency || 'USD',
        stock_on_hand: v.stock_on_hand,
        is_active: v.is_active,
        options: (options || []).map(o => ({ name: o.name, value: o.value }))
    } as Variant;
}

// =============================================================================
// CATEGORIES & BRANDS
// =============================================================================

export async function getCategories(): Promise<Category[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error) return [];
    return (data || []) as Category[];
}

export async function getCategoryTree(): Promise<(Category & { children: Category[] })[]> {
    const categories = await getCategories();
    const roots = categories.filter(c => !c.parent_id);

    return roots.map(root => ({
        ...root,
        children: categories.filter(c => c.parent_id === root.id)
    }));
}

export async function getBrands(): Promise<Brand[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('brands')
        .select('id, slug, name, logo_url, is_active, tagline, follower_count, rating_avg, response_rate, on_time_ship_rate')
        .eq('is_active', true);

    if (error) return [];
    return (data || []) as Brand[];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
    const supabase = getSupabase();

    const { data: brand, error } = await supabase
        .from('brands')
        .select('id, slug, name, logo_url, is_active, tagline, follower_count, rating_avg, response_rate, on_time_ship_rate')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !brand) return null;
    return brand as Brand;
}

// =============================================================================
// IMAGES
// =============================================================================

export async function getProductImages(productId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');

    if (error) return [];
    return data || [];
}

// =============================================================================
// REVIEWS
// =============================================================================

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as Review[];
}

async function getCartByKey(key: string): Promise<{ cart: any; isUserId: boolean } | null> {
    const supabase = getSupabase();

    // Try to find by user_id first (if it's a UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);

    if (isUUID) {
        const { data } = await supabase
            .from('carts')
            .select('*, cart_items(*)')
            .eq('user_id', key)
            .eq('status', 'active')
            .single();
        if (data) return { cart: data, isUserId: true };
    }

    // Try session_id
    const { data } = await supabase
        .from('carts')
        .select('*, cart_items(*)')
        .eq('session_id', key)
        .eq('status', 'active')
        .single();

    if (data) return { cart: data, isUserId: false };
    return null;
}

function formatCart(cartData: any): Cart {
    const items: CartItem[] = (cartData.cart_items || []).map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: money(item.unit_price, item.currency || 'USD'),
        line_total: money(item.unit_price * item.qty, item.currency || 'USD'),
        title_snapshot: item.title_snapshot || '',
        variant_snapshot: item.variant_snapshot || {}
    }));

    const subtotal = items.reduce((sum, item) => sum + item.line_total.amount, 0);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    return {
        id: cartData.id,
        status: cartData.status,
        currency: cartData.currency || 'USD',
        items,
        subtotal: money(subtotal),
        discount_total: money(0),
        shipping_total: money(0),
        grand_total: money(subtotal),
        item_count: itemCount,
        coupon_code: null
    };
}

export async function getCart(sessionKey: string): Promise<Cart | null> {
    const result = await getCartByKey(sessionKey);
    if (!result) return null;
    return formatCart(result.cart);
}

export async function getOrCreateCart(sessionKey: string): Promise<Cart> {
    const supabase = getSupabase();

    const existing = await getCartByKey(sessionKey);
    if (existing) return formatCart(existing.cart);

    // Create new cart
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionKey);

    const { data: newCart, error } = await supabase
        .from('carts')
        .insert({
            user_id: isUUID ? sessionKey : null,
            session_id: isUUID ? null : sessionKey,
            status: 'active',
            currency: 'USD'
        })
        .select()
        .single();

    if (error || !newCart) {
        throw new Error('Failed to create cart');
    }

    return formatCart({ ...newCart, cart_items: [] });
}

export async function addCartItem(
    sessionKey: string,
    variantId: string,
    qty: number
): Promise<Cart> {
    const supabase = getSupabase();

    const cart = await getOrCreateCart(sessionKey);
    const variant = await getVariantById(variantId);

    if (!variant) {
        throw new Error('Variant not found');
    }

    // Check if item exists
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .single();

    if (existingItem) {
        // Update quantity
        await supabase
            .from('cart_items')
            .update({ qty: existingItem.qty + qty, updated_at: new Date().toISOString() })
            .eq('id', existingItem.id);
    } else {
        // Get product for title
        const product = await getProductById(variant.product_id);

        // Insert new item
        await supabase
            .from('cart_items')
            .insert({
                cart_id: cart.id,
                variant_id: variantId,
                qty,
                unit_price: variant.price,
                currency: variant.currency,
                title_snapshot: product?.title || variant.title,
                variant_snapshot: (variant.options || []).reduce((acc, opt) => ({ ...acc, [opt.name]: opt.value }), {})
            });
    }

    // Return updated cart
    return (await getCart(sessionKey))!;
}

export async function updateCartItem(
    sessionKey: string,
    itemId: string,
    qty: number
): Promise<Cart> {
    const supabase = getSupabase();

    const cart = await getCart(sessionKey);
    if (!cart) throw new Error('Cart not found');

    if (qty <= 0) {
        // Remove item if qty is 0 or less
        await supabase.from('cart_items').delete().eq('id', itemId);
    } else {
        await supabase
            .from('cart_items')
            .update({ qty, updated_at: new Date().toISOString() })
            .eq('id', itemId);
    }

    return (await getCart(sessionKey))!;
}

export async function removeCartItem(
    sessionKey: string,
    itemId: string
): Promise<Cart> {
    const supabase = getSupabase();

    await supabase.from('cart_items').delete().eq('id', itemId);

    return (await getCart(sessionKey))!;
}

export async function applyCouponToCart(
    sessionKey: string,
    couponCode: string
): Promise<{ cart: Cart; error?: string }> {
    const supabase = getSupabase();

    const cart = await getCart(sessionKey);
    if (!cart) return { cart: await getOrCreateCart(sessionKey), error: 'Cart not found' };

    // Find valid coupon
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('status', 'active')
        .single();

    if (error || !coupon) {
        return { cart, error: 'Invalid coupon code' };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return { cart, error: 'Coupon not yet active' };
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
        return { cart, error: 'Coupon has expired' };
    }

    // Check minimum order
    if (cart.subtotal.amount < coupon.min_order_subtotal) {
        return { cart, error: `Minimum order of $${coupon.min_order_subtotal / 100} required` };
    }

    // TODO: Apply discount calculation and update cart
    // For now, just return success
    return { cart };
}

// =============================================================================
// CART MERGE (UNUSED - Cart is auth-required, no guest cart)
// TODO: Remove if guest cart is never needed
// =============================================================================

export async function mergeCarts(guestSessionId: string, userId: string): Promise<Cart | null> {
    const supabase = getSupabase();

    // 1. Get Guest Cart
    const guestCartRes = await getCartByKey(guestSessionId);
    if (!guestCartRes) return await getOrCreateCart(userId); // Nothing to merge

    const guestCart = guestCartRes.cart;
    if (guestCart.user_id) {
        // Guest session is actually already linked to a user? Should not happen if logic is correct.
        // Or if guestSessionId was actually a userId.
        return await getOrCreateCart(userId);
    }

    // 2. Get (or create) User Cart
    const userCart = await getOrCreateCart(userId);

    // 3. Merge Items
    if (guestCart.cart_items && guestCart.cart_items.length > 0) {
        for (const guestItem of guestCart.cart_items) {
            const existingItem = userCart.items.find((i) => i.variant_id === guestItem.variant_id);

            const variant = await getVariantById(guestItem.variant_id);
            if (!variant) continue; // Variant deleted?

            if (existingItem) {
                // Update quantity, cap at stock
                const newQty = existingItem.qty + guestItem.qty;
                const finalQty = Math.min(newQty, variant.stock_on_hand);

                if (finalQty !== existingItem.qty) {
                    await supabase
                        .from('cart_items')
                        .update({ qty: finalQty, updated_at: new Date().toISOString() })
                        .eq('id', existingItem.id);
                }
            } else {
                // Insert new item, cap at stock
                const qty = Math.min(guestItem.qty, variant.stock_on_hand);
                await supabase
                    .from('cart_items')
                    .insert({
                        cart_id: userCart.id,
                        variant_id: guestItem.variant_id,
                        qty: qty,
                        unit_price: guestItem.unit_price, // preserve historic price or update? usually update to current.
                        currency: guestItem.currency || 'USD',
                        title_snapshot: guestItem.title_snapshot,
                        variant_snapshot: guestItem.variant_snapshot
                    });
            }
        }
    }

    // 4. Delete Guest Cart
    await supabase.from('carts').delete().eq('id', guestCart.id);

    // 5. Return updated User Cart
    return await getCart(userId);
}

// =============================================================================
// SHIPPING
// =============================================================================

export async function getShippingMethods(): Promise<ShippingMethod[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true);

    if (error) return [];
    return (data || []) as ShippingMethod[];
}

// =============================================================================
// ADDRESSES
// =============================================================================

export async function getUserAddresses(userId: string): Promise<Address[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    if (error) return [];
    return (data || []) as Address[];
}

// =============================================================================
// ORDERS
// =============================================================================

function generateOrderNumber(): string {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TC-${yy}${mm}${dd}-${rand}`;
}

export async function createOrder(
    userId: string,
    sessionKey: string,
    shippingAddressId: string,
    shippingMethodId: string
): Promise<Order> {
    const supabase = getSupabase();

    const cart = await getCart(sessionKey);
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    const shippingMethods = await getShippingMethods();
    const shippingMethod = shippingMethods.find(m => m.id === shippingMethodId);
    if (!shippingMethod) {
        throw new Error('Invalid shipping method');
    }

    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    // Create order
    const { data: order, error } = await supabase
        .from('shop_orders')
        .insert({
            order_number: orderNumber,
            user_id: userId,
            status: 'pending',
            payment_status: 'pending',
            currency: cart.currency,
            subtotal: cart.subtotal.amount,
            discount_total: cart.discount_total.amount,
            shipping_total: shippingMethod.base_fee,
            grand_total: cart.subtotal.amount - cart.discount_total.amount + shippingMethod.base_fee,
            shipping_address_id: shippingAddressId,
            shipping_method_id: shippingMethodId,
            created_at: now,
            updated_at: now
        })
        .select()
        .single();

    if (error || !order) {
        throw new Error('Failed to create order');
    }

    // Create order items
    for (const item of cart.items) {
        await supabase
            .from('order_items')
            .insert({
                order_id: order.id,
                variant_id: item.variant_id,
                qty: item.qty,
                unit_price: item.unit_price.amount,
                currency: item.unit_price.currency,
                title_snapshot: item.title_snapshot,
                variant_snapshot: item.variant_snapshot
            });
    }

    // Mark cart as converted
    await supabase
        .from('carts')
        .update({ status: 'converted', updated_at: now })
        .eq('id', cart.id);

    return {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        status: order.status,
        payment_status: order.payment_status,
        currency: order.currency,
        subtotal: money(order.subtotal),
        discount_total: money(order.discount_total),
        shipping_total: money(order.shipping_total),
        grand_total: money(order.grand_total),
        items: cart.items,
        shipping_address_id: order.shipping_address_id,
        shipping_method_id: order.shipping_method_id,
        created_at: order.created_at,
        updated_at: order.updated_at
    } as Order;
}

export async function getOrders(userId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
}): Promise<{ data: Order[]; total: number }> {
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    let query = supabase
        .from('shop_orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (params?.status) {
        query = query.eq('status', params.status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) return { data: [], total: 0 };

    const orders = (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        user_id: o.user_id,
        status: o.status,
        payment_status: o.payment_status,
        currency: o.currency,
        subtotal: money(o.subtotal),
        discount_total: money(o.discount_total),
        shipping_total: money(o.shipping_total),
        grand_total: money(o.grand_total),
        shipping_address_id: o.shipping_address_id,
        shipping_method_id: o.shipping_method_id,
        created_at: o.created_at,
        updated_at: o.updated_at
    })) as Order[];

    return { data: orders, total: count || 0 };
}

export async function getOrderByNumber(userId: string, orderNumber: string): Promise<Order | null> {
    const supabase = getSupabase();

    const { data: o, error } = await supabase
        .from('shop_orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .single();

    if (error || !o) return null;

    const items: CartItem[] = (o.order_items || []).map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: money(item.unit_price, item.currency),
        line_total: money(item.unit_price * item.qty, item.currency),
        title_snapshot: item.title_snapshot,
        variant_snapshot: item.variant_snapshot || {}
    }));

    return {
        id: o.id,
        order_number: o.order_number,
        user_id: o.user_id,
        status: o.status,
        payment_status: o.payment_status,
        currency: o.currency,
        subtotal: money(o.subtotal),
        discount_total: money(o.discount_total),
        shipping_total: money(o.shipping_total),
        grand_total: money(o.grand_total),
        items,
        shipping_address_id: o.shipping_address_id,
        shipping_method_id: o.shipping_method_id,
        created_at: o.created_at,
        updated_at: o.updated_at
    } as Order;
}

export async function cancelOrder(userId: string, orderId: string): Promise<Order> {
    const supabase = getSupabase();

    const { data: order } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (!order) throw new Error('Order not found');
    if (order.status !== 'pending') throw new Error('Only pending orders can be cancelled');

    const { data: updated, error } = await supabase
        .from('shop_orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

    if (error || !updated) throw new Error('Failed to cancel order');

    return {
        id: updated.id,
        order_number: updated.order_number,
        user_id: updated.user_id,
        status: updated.status,
        payment_status: updated.payment_status,
        currency: updated.currency,
        subtotal: money(updated.subtotal),
        discount_total: money(updated.discount_total),
        shipping_total: money(updated.shipping_total),
        grand_total: money(updated.grand_total),
        created_at: updated.created_at,
        updated_at: updated.updated_at
    } as Order;
}

// =============================================================================
// VOUCHERS
// =============================================================================

export async function getAvailableVouchers(): Promise<VoucherTemplate[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('voucher_templates')
        .select('*')
        .eq('is_active', true);

    if (error) return [];
    return (data || []) as VoucherTemplate[];
}

export async function getUserVouchers(userId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_user_vouchers')
        .select('*, voucher_templates(*)')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (error) return [];
    return data || [];
}

export async function redeemVoucher(userId: string, templateId: string, tcentBalance: number) {
    const supabase = getSupabase();

    // Get template
    const { data: template } = await supabase
        .from('voucher_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

    if (!template) return { error: 'VOUCHER_NOT_FOUND' };
    if (tcentBalance < template.tcent_cost) return { error: 'INSUFFICIENT_TCENT' };
    if (template.redeemed_count >= template.total_inventory) return { error: 'VOUCHER_SOLD_OUT' };

    // Create user voucher
    const expiresAt = new Date(Date.now() + template.validity_days * 24 * 60 * 60 * 1000).toISOString();

    const { data: voucher, error } = await supabase
        .from('shop_user_vouchers')
        .insert({
            template_id: templateId,
            user_id: userId,
            status: 'active',
            expires_at: expiresAt
        })
        .select()
        .single();

    if (error) return { error: 'FAILED_TO_CREATE' };

    // Update template redeemed count
    await supabase
        .from('voucher_templates')
        .update({ redeemed_count: template.redeemed_count + 1 })
        .eq('id', templateId);

    return { data: voucher, tcent_deducted: template.tcent_cost };
}

// =============================================================================
// WISHLIST
// =============================================================================

export async function getWishlist(userId: string): Promise<Product[]> {
    const supabase = getSupabase();

    const { data: wishlistItems } = await supabase
        .from('shop_wishlist')
        .select('product_id')
        .eq('user_id', userId);

    if (!wishlistItems || wishlistItems.length === 0) return [];

    const productIds = wishlistItems.map(w => w.product_id);

    const { data: products } = await supabase
        .from('shop_products')
        .select('*')
        .in('id', productIds)
        .eq('status', 'active');

    return (products || []) as Product[];
}

export async function addToWishlist(userId: string, productId: string): Promise<string[]> {
    const supabase = getSupabase();

    // Check if already in wishlist
    const { data: existing } = await supabase
        .from('shop_wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (!existing) {
        await supabase
            .from('shop_wishlist')
            .insert({ user_id: userId, product_id: productId });
    }

    // Return updated list
    const { data } = await supabase
        .from('shop_wishlist')
        .select('product_id')
        .eq('user_id', userId);

    return (data || []).map(w => w.product_id);
}

export async function removeFromWishlist(userId: string, productId: string): Promise<string[]> {
    const supabase = getSupabase();

    await supabase
        .from('shop_wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    // Return updated list
    const { data } = await supabase
        .from('shop_wishlist')
        .select('product_id')
        .eq('user_id', userId);

    return (data || []).map(w => w.product_id);
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
    const supabase = getSupabase();

    const { data: review, error } = await supabase
        .from('shop_reviews')
        .insert({
            user_id: data.userId,
            product_id: data.productId,
            rating: data.rating,
            title: data.title || '',
            body: data.body || '',
            status: 'pending' // Needs moderation
        })
        .select()
        .single();

    if (error) throw new Error('Failed to create review');
    return review;
}

export async function getOrderHistory(userId: string, orderId: string): Promise<any[]> {
    const supabase = getSupabase();

    const { data: order } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (!order) return [];

    const history = [
        {
            id: `hist-created-${order.id.slice(0, 8)}`,
            old_status: null,
            new_status: 'pending',
            old_payment_status: null,
            new_payment_status: order.payment_status,
            changed_by_type: 'system',
            notes: 'Order placed',
            created_at: order.created_at
        }
    ];

    if (order.status === 'cancelled') {
        history.push({
            id: `hist-cancel-${order.id.slice(0, 8)}`,
            old_status: 'pending',
            new_status: 'cancelled',
            old_payment_status: order.payment_status,
            new_payment_status: order.payment_status,
            changed_by_type: 'user',
            notes: 'Order cancelled by user',
            created_at: order.updated_at
        });
    }

    return history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
