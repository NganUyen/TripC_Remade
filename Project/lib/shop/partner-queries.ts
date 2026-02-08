/**
 * Shop Partner Queries
 *
 * Business logic layer for the Partner/Vendor system.
 * Follows the same patterns as lib/shop/queries.ts:
 *   - Uses service-role Supabase client (bypasses RLS)
 *   - Returns typed data
 *   - Handles errors gracefully
 */

import { createServiceSupabaseClient } from '../supabase-server';
import type {
    ShopPartner,
    PartnerMember,
    PartnerWithMembership,
    PartnerProduct,
    PartnerOrder,
    PartnerOrderItem,
    PartnerApplicationData,
    DashboardStats,
    Money,
    Product,
} from './types';

// =============================================================================
// HELPERS
// =============================================================================

function getSupabase() {
    return createServiceSupabaseClient();
}

function money(amount: number, currency = 'USD'): Money {
    return { amount, currency };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function generatePartnerSlug(businessName: string, id: string): string {
    const base = slugify(businessName);
    const suffix = id.slice(0, 6);
    return `${base}-${suffix}`;
}

// =============================================================================
// PARTNER AUTH HELPERS
// =============================================================================

/**
 * Get the partner membership for a given user.
 * Returns the partner + membership info, or null if not a partner.
 */
export async function getPartnerMembership(userId: string): Promise<PartnerWithMembership | null> {
    const supabase = getSupabase();

    const { data: membership, error: memError } = await supabase
        .from('shop_partner_members')
        .select('*, partner:shop_partners(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (memError || !membership) return null;

    const partner = membership.partner as unknown as ShopPartner;
    if (!partner || partner.deleted_at) return null;

    return {
        ...partner,
        role: membership.role,
        permissions: membership.permissions || { products: true, orders: true, analytics: false },
    } as PartnerWithMembership;
}

/**
 * Check if user has partner access and required role.
 * Returns { partner, membership } or throws descriptive error.
 */
export async function requirePartnerAccess(
    userId: string,
    requiredRole?: 'owner' | 'staff'
): Promise<PartnerWithMembership> {
    const partner = await getPartnerMembership(userId);

    if (!partner) {
        throw new PartnerError('NOT_PARTNER', 'User is not a partner', 404);
    }

    if (partner.status === 'pending') {
        throw new PartnerError('PARTNER_PENDING', 'Partner application is pending review', 403);
    }

    if (partner.status === 'suspended') {
        throw new PartnerError('PARTNER_SUSPENDED', 'Partner account is suspended', 403);
    }

    if (partner.status === 'banned') {
        throw new PartnerError('PARTNER_SUSPENDED', 'Partner account is banned', 403);
    }

    if (partner.status !== 'approved') {
        throw new PartnerError('FORBIDDEN', 'Partner account is not active', 403);
    }

    if (requiredRole === 'owner' && partner.role !== 'owner') {
        throw new PartnerError('FORBIDDEN', 'Only partner owner can perform this action', 403);
    }

    return partner;
}

export class PartnerError extends Error {
    code: string;
    status: number;
    details?: Record<string, unknown>;

    constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

// =============================================================================
// PARTNER PROFILE
// =============================================================================

/**
 * Apply as a new partner. Creates shop_partners + shop_partner_members (owner).
 */
export async function applyAsPartner(
    userId: string,
    data: PartnerApplicationData
): Promise<ShopPartner> {
    const supabase = getSupabase();

    // Check if user already has a partner account
    const existing = await getPartnerMembership(userId);
    if (existing) {
        throw new PartnerError('ALREADY_PARTNER', 'User already has a partner account', 409);
    }

    // Generate a temporary slug (will be updated with actual ID)
    const tempSlug = slugify(data.business_name) + '-' + Date.now().toString(36);

    // Create partner
    const { data: partner, error } = await supabase
        .from('shop_partners')
        .insert({
            slug: tempSlug,
            business_name: data.business_name,
            display_name: data.display_name || data.business_name,
            description: data.description,
            email: data.email,
            phone: data.phone,
            website: data.website,
            business_type: data.business_type || 'individual',
            business_registration_number: data.business_registration_number,
            tax_id: data.tax_id,
            address_line1: data.address_line1,
            city: data.city,
            country_code: data.country_code || 'VN',
            status: 'approved', // Auto-approve (TODO: replace with AI verification)
            verified_at: new Date().toISOString(),
        })
        .select('*')
        .single();

    if (error || !partner) {
        console.error('applyAsPartner insert error:', error);
        throw new PartnerError('INTERNAL_ERROR', 'Failed to create partner application', 500);
    }

    // Update slug with actual ID
    const finalSlug = generatePartnerSlug(data.business_name, partner.id);
    await supabase
        .from('shop_partners')
        .update({ slug: finalSlug })
        .eq('id', partner.id);

    // Create owner membership
    const { error: memberError } = await supabase
        .from('shop_partner_members')
        .insert({
            partner_id: partner.id,
            user_id: userId,
            role: 'owner',
            status: 'active',
            accepted_at: new Date().toISOString(),
            permissions: { products: true, orders: true, analytics: true },
        });

    if (memberError) {
        console.error('applyAsPartner member error:', memberError);
        // Rollback partner
        await supabase.from('shop_partners').delete().eq('id', partner.id);
        throw new PartnerError('INTERNAL_ERROR', 'Failed to create partner membership', 500);
    }

    // Also create a corresponding brand entry
    const { data: brand } = await supabase
        .from('brands')
        .insert({
            slug: finalSlug,
            name: data.display_name || data.business_name,
            logo_url: null,
            is_active: true, // Active immediately since partner is auto-approved
            tagline: data.description?.substring(0, 100),
            description: data.description,
        })
        .select('id')
        .single();

    if (brand) {
        await supabase
            .from('shop_partners')
            .update({ brand_id: brand.id })
            .eq('id', partner.id);
    }

    return { ...partner, slug: finalSlug } as ShopPartner;
}

/**
 * Get a partner by slug (public view - approved only).
 */
export async function getPartnerBySlug(slug: string): Promise<ShopPartner | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_partners')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .single();

    if (error || !data) return null;
    return data as ShopPartner;
}

/**
 * Update partner profile (owner only - caller must verify).
 */
export async function updatePartnerProfile(
    partnerId: string,
    data: Partial<Pick<ShopPartner, 'display_name' | 'description' | 'logo_url' | 'cover_url' | 'phone' | 'website'>>
): Promise<ShopPartner> {
    const supabase = getSupabase();

    const { data: updated, error } = await supabase
        .from('shop_partners')
        .update(data)
        .eq('id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to update partner profile', 500);
    }

    // Sync display_name/logo to brands table if brand_id exists
    if (updated.brand_id && (data.display_name || data.logo_url || data.description || data.cover_url)) {
        const brandUpdate: Record<string, unknown> = {};
        if (data.display_name) brandUpdate.name = data.display_name;
        if (data.logo_url) brandUpdate.logo_url = data.logo_url;
        if (data.description) brandUpdate.description = data.description;
        if (data.cover_url) brandUpdate.cover_url = data.cover_url;

        await supabase.from('brands').update(brandUpdate).eq('id', updated.brand_id);
    }

    return updated as ShopPartner;
}

// =============================================================================
// PARTNER PRODUCTS
// =============================================================================

/**
 * List products owned by a partner (all statuses, for partner dashboard).
 */
export async function getPartnerProducts(
    partnerId: string,
    params?: {
        limit?: number;
        offset?: number;
        status?: string;
        search?: string;
        sort?: string;
    }
): Promise<{ data: PartnerProduct[]; total: number }> {
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    // BUG-007 Fix: Removed redundant query that was immediately overwritten
    let query = supabase
        .from('shop_products')
        .select('*, variants:product_variants(*), images:product_images(*), category:categories(*)', { count: 'exact' })
        .eq('partner_id', partnerId);

    if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    }

    if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
    }

    switch (params?.sort) {
        case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
        case 'title':
            query = query.order('title', { ascending: true });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error('getPartnerProducts error:', error);
        return { data: [], total: 0 };
    }

    const products = (data || []).map((p: any) => ({
        ...p,
        variants: p.variants || [],
        images: p.images || [],
        category: p.category,
        stock_total: (p.variants || []).reduce((sum: number, v: any) => sum + (v.stock_on_hand || 0), 0),
    })) as PartnerProduct[];

    return { data: products, total: count || 0 };
}

/**
 * Get a single product by ID (for partner editing). Does NOT restrict by status.
 */
export async function getPartnerProductById(
    partnerId: string,
    productId: string
): Promise<PartnerProduct | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_products')
        .select('*, variants:product_variants(*, options:variant_options(*)), images:product_images(*), category:categories(*)')
        .eq('id', productId)
        .eq('partner_id', partnerId)
        .single();

    if (error || !data) return null;

    return {
        ...data,
        variants: data.variants || [],
        images: data.images || [],
        stock_total: (data.variants || []).reduce((sum: number, v: any) => sum + (v.stock_on_hand || 0), 0),
    } as PartnerProduct;
}

/**
 * Create a product draft for a partner.
 */
export async function createPartnerProduct(
    partnerId: string,
    data: {
        title: string;
        description?: string;
        category_id?: string;
        product_type?: string;
    }
): Promise<Product> {
    const supabase = getSupabase();

    const slug = slugify(data.title) + '-' + partnerId.slice(0, 6);

    // Get partner's brand_id
    const { data: partner } = await supabase
        .from('shop_partners')
        .select('brand_id')
        .eq('id', partnerId)
        .single();

    const { data: product, error } = await supabase
        .from('shop_products')
        .insert({
            slug,
            title: data.title,
            description: data.description || '',
            category_id: data.category_id || null,
            brand_id: partner?.brand_id || null,
            partner_id: partnerId,
            product_type: data.product_type || 'physical',
            status: 'draft',
        })
        .select('*')
        .single();

    if (error || !product) {
        console.error('createPartnerProduct error:', error);
        throw new PartnerError('INTERNAL_ERROR', 'Failed to create product', 500);
    }

    return { ...product, variants: [], images: [] } as Product;
}

/**
 * Update a product owned by the partner.
 */
export async function updatePartnerProduct(
    partnerId: string,
    productId: string,
    data: Partial<Pick<Product, 'title' | 'description' | 'category_id' | 'product_type'>>
): Promise<Product> {
    const supabase = getSupabase();

    // Verify ownership
    const existing = await getPartnerProductById(partnerId, productId);
    if (!existing) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    if (existing.status === 'flagged') {
        throw new PartnerError('FORBIDDEN', 'Cannot edit a flagged product', 403);
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.title) {
        updateData.slug = slugify(data.title) + '-' + partnerId.slice(0, 6);
    }

    const { data: updated, error } = await supabase
        .from('shop_products')
        .update(updateData)
        .eq('id', productId)
        .eq('partner_id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to update product', 500);
    }

    return { ...updated, variants: existing.variants, images: existing.images } as Product;
}

/**
 * Publish a product (draft -> active). Validates required fields.
 */
export async function publishPartnerProduct(
    partnerId: string,
    productId: string
): Promise<Product> {
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    if (product.status !== 'draft' && product.status !== 'archived') {
        throw new PartnerError('VALIDATION_ERROR', `Cannot publish product with status '${product.status}'`, 400);
    }

    // Validate publishing requirements
    const errors: { field: string; message: string }[] = [];

    if (!product.title || product.title.length < 3) {
        errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    }
    if (!product.description || product.description.length < 50) {
        errors.push({ field: 'description', message: 'Description must be at least 50 characters' });
    }
    if (!product.variants || product.variants.length === 0) {
        errors.push({ field: 'variants', message: 'At least 1 variant with price required' });
    }
    if (!product.images || product.images.length === 0) {
        errors.push({ field: 'images', message: 'At least 1 image required' });
    }
    if (product.variants?.length > 0) {
        const hasPrice = product.variants.some(v => v.price > 0);
        if (!hasPrice) {
            errors.push({ field: 'variants', message: 'At least 1 variant must have a price > 0' });
        }
    }

    if (errors.length > 0) {
        throw new PartnerError('VALIDATION_ERROR', 'Product cannot be published', 400, { details: errors });
    }

    const supabase = getSupabase();
    const { data: updated, error } = await supabase
        .from('shop_products')
        .update({ status: 'active' })
        .eq('id', productId)
        .eq('partner_id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to publish product', 500);
    }

    return { ...updated, variants: product.variants, images: product.images } as Product;
}

/**
 * Archive a product (active -> archived).
 */
export async function archivePartnerProduct(
    partnerId: string,
    productId: string
): Promise<Product> {
    const supabase = getSupabase();

    const { data: updated, error } = await supabase
        .from('shop_products')
        .update({ status: 'archived' })
        .eq('id', productId)
        .eq('partner_id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    return { ...updated, variants: [], images: [] } as Product;
}

/**
 * Delete a product (soft delete via status check + remove).
 */
export async function deletePartnerProduct(
    partnerId: string,
    productId: string
): Promise<void> {
    const supabase = getSupabase();

    // Check if product has orders
    const { count } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId);

    if (count && count > 0) {
        throw new PartnerError('HAS_ORDERS', 'Cannot delete product with existing orders', 409);
    }

    // Delete associated data first
    await supabase.from('product_images').delete().eq('product_id', productId);
    await supabase.from('variant_options').delete().in(
        'variant_id',
        (await supabase.from('product_variants').select('id').eq('product_id', productId)).data?.map((v: any) => v.id) || []
    );
    await supabase.from('product_variants').delete().eq('product_id', productId);

    const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', productId)
        .eq('partner_id', partnerId);

    if (error) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to delete product', 500);
    }
}

// =============================================================================
// VARIANTS
// =============================================================================

export async function createVariant(
    partnerId: string,
    productId: string,
    data: {
        sku: string;
        title: string;
        price: number;
        compare_at_price?: number;
        stock_on_hand?: number;
        options?: { name: string; value: string }[];
    }
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    // BUG-008 Fix: Validate variant price
    if (data.price <= 0) {
        throw new PartnerError('VALIDATION_ERROR', 'Price must be greater than 0', 400);
    }
    if (data.compare_at_price && data.compare_at_price <= data.price) {
        throw new PartnerError('VALIDATION_ERROR', 'Compare at price must be greater than regular price', 400);
    }

    const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
            product_id: productId,
            sku: data.sku,
            title: data.title,
            price: data.price,
            compare_at_price: data.compare_at_price || null,
            stock_on_hand: data.stock_on_hand || 0,
            is_active: true,
        })
        .select('*')
        .single();

    if (error || !variant) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to create variant', 500);
    }

    // Create variant options
    if (data.options && data.options.length > 0) {
        const optionsData = data.options.map(opt => ({
            variant_id: variant.id,
            option_name: opt.name,
            option_value: opt.value,
        }));

        await supabase.from('variant_options').insert(optionsData);
    }

    return variant;
}

export async function updateVariant(
    partnerId: string,
    productId: string,
    variantId: string,
    data: Partial<{
        sku: string;
        title: string;
        price: number;
        compare_at_price: number;
        stock_on_hand: number;
        is_active: boolean;
    }>
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    const { data: updated, error } = await supabase
        .from('product_variants')
        .update(data)
        .eq('id', variantId)
        .eq('product_id', productId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('NOT_FOUND', 'Variant not found', 404);
    }

    return updated;
}

export async function deleteVariant(
    partnerId: string,
    productId: string,
    variantId: string
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    // Delete options first
    await supabase.from('variant_options').delete().eq('variant_id', variantId);

    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)
        .eq('product_id', productId);

    if (error) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to delete variant', 500);
    }
}

// =============================================================================
// IMAGES
// =============================================================================

export async function addProductImage(
    partnerId: string,
    productId: string,
    data: { url: string; alt?: string; is_primary?: boolean }
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    // Get current max sort_order
    const { data: existingImages } = await supabase
        .from('product_images')
        .select('sort_order')
        .eq('product_id', productId)
        .order('sort_order', { ascending: false })
        .limit(1);

    const nextOrder = (existingImages?.[0]?.sort_order || 0) + 1;

    // If this is set as primary, unset others
    if (data.is_primary) {
        await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', productId);
    }

    const { data: image, error } = await supabase
        .from('product_images')
        .insert({
            product_id: productId,
            url: data.url,
            alt: data.alt || '',
            sort_order: nextOrder,
            is_primary: data.is_primary || nextOrder === 1,
        })
        .select('*')
        .single();

    if (error || !image) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to add image', 500);
    }

    return image;
}

export async function deleteProductImage(
    partnerId: string,
    productId: string,
    imageId: string
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)
        .eq('product_id', productId);

    if (error) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to delete image', 500);
    }
}

export async function reorderProductImages(
    partnerId: string,
    productId: string,
    imageIds: string[]
) {
    const supabase = getSupabase();

    // Verify product ownership
    const product = await getPartnerProductById(partnerId, productId);
    if (!product) {
        throw new PartnerError('NOT_FOUND', 'Product not found', 404);
    }

    // Update sort_order for each image
    const updates = imageIds.map((id, index) =>
        supabase
            .from('product_images')
            .update({ sort_order: index, is_primary: index === 0 })
            .eq('id', id)
            .eq('product_id', productId)
    );

    await Promise.all(updates);
}

// =============================================================================
// ORDERS
// =============================================================================

/**
 * Get orders that contain items from this partner.
 */
export async function getPartnerOrders(
    partnerId: string,
    params?: {
        limit?: number;
        offset?: number;
        status?: string;
        from?: string;
        to?: string;
    }
): Promise<{ data: PartnerOrder[]; total: number }> {
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    // Get order IDs that contain partner's items
    let itemsQuery = supabase
        .from('order_items')
        .select('order_id, qty, unit_price, line_total, title_snapshot, variant_snapshot, image_url_snapshot, product_id, variant_id')
        .eq('partner_id', partnerId);

    const { data: partnerItems, error: itemsError } = await itemsQuery;

    if (itemsError || !partnerItems || partnerItems.length === 0) {
        return { data: [], total: 0 };
    }

    // Group items by order_id
    const orderIds = [...new Set(partnerItems.map(i => i.order_id))];

    let ordersQuery = supabase
        .from('shop_orders')
        .select('*', { count: 'exact' })
        .in('id', orderIds);

    if (params?.status) {
        ordersQuery = ordersQuery.eq('status', params.status);
    }
    if (params?.from) {
        ordersQuery = ordersQuery.gte('created_at', params.from);
    }
    if (params?.to) {
        ordersQuery = ordersQuery.lte('created_at', params.to);
    }

    ordersQuery = ordersQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data: orders, count, error: ordersError } = await ordersQuery;

    if (ordersError || !orders) {
        return { data: [], total: 0 };
    }

    // Map orders with partner-specific items
    const partnerOrders: PartnerOrder[] = orders.map((order: any) => {
        const items = partnerItems
            .filter(i => i.order_id === order.id)
            .map(i => ({
                id: i.product_id || '',
                product_id: i.product_id || '',
                product_title: i.title_snapshot || '',
                variant_id: i.variant_id || '',
                variant_title: (i.variant_snapshot as any)?.title || '',
                qty: i.qty,
                unit_price: money(Number(i.unit_price)),
                line_total: money(Number(i.line_total)),
                image_url: i.image_url_snapshot,
            }));

        const partnerSubtotal = items.reduce((sum, i) => sum + i.line_total.amount, 0);

        return {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            customer_name: order.shipping_address_snapshot?.recipient_name || 'Customer',
            item_count: items.length,
            partner_subtotal: money(partnerSubtotal),
            items,
            shipping_address: order.shipping_address_snapshot,
            created_at: order.created_at,
            updated_at: order.updated_at,
        };
    });

    return { data: partnerOrders, total: count || 0 };
}

/**
 * Get a single order detail (for partner view).
 */
export async function getPartnerOrderById(
    partnerId: string,
    orderId: string
): Promise<PartnerOrder | null> {
    const { data: orders } = await getPartnerOrders(partnerId, { limit: 1 });
    // Find specific order by getting all partner orders for this specific orderId
    const supabase = getSupabase();

    const { data: partnerItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('order_id', orderId);

    if (!partnerItems || partnerItems.length === 0) return null;

    const { data: order } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (!order) return null;

    const items: PartnerOrderItem[] = partnerItems.map((i: any) => ({
        id: i.id,
        product_id: i.product_id || '',
        product_title: i.title_snapshot || '',
        variant_id: i.variant_id || '',
        variant_title: (i.variant_snapshot as any)?.title || '',
        qty: i.qty,
        unit_price: money(Number(i.unit_price)),
        line_total: money(Number(i.line_total)),
        image_url: i.image_url_snapshot,
    }));

    const partnerSubtotal = items.reduce((sum, i) => sum + i.line_total.amount, 0);

    return {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        customer_name: (order.shipping_address_snapshot as any)?.recipient_name || 'Customer',
        item_count: items.length,
        partner_subtotal: money(partnerSubtotal),
        items,
        shipping_address: order.shipping_address_snapshot as Record<string, unknown>,
        created_at: order.created_at,
        updated_at: order.updated_at,
    };
}

// =============================================================================
// ANALYTICS
// =============================================================================

export async function getPartnerDashboardStats(
    partnerId: string,
    period: string = '7d'
): Promise<DashboardStats> {
    const supabase = getSupabase();

    // Calculate date range
    const now = new Date();
    let daysBack = 7;
    switch (period) {
        case 'today': daysBack = 1; break;
        case '7d': daysBack = 7; break;
        case '30d': daysBack = 30; break;
        case '12m': daysBack = 365; break;
    }

    const fromDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const prevFromDate = new Date(fromDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Current period order items
    const { data: currentItems } = await supabase
        .from('order_items')
        .select('line_total, qty, order_id, created_at')
        .eq('partner_id', partnerId)
        .gte('created_at', fromDate.toISOString());

    // Previous period for comparison
    const { data: prevItems } = await supabase
        .from('order_items')
        .select('line_total, qty, order_id')
        .eq('partner_id', partnerId)
        .gte('created_at', prevFromDate.toISOString())
        .lt('created_at', fromDate.toISOString());

    const currentRevenue = (currentItems || []).reduce((sum, i) => sum + Number(i.line_total || 0), 0);
    const prevRevenue = (prevItems || []).reduce((sum, i) => sum + Number(i.line_total || 0), 0);

    const currentOrderIds = new Set((currentItems || []).map(i => i.order_id));
    const currentOrders = currentOrderIds.size;
    const prevOrderIds = new Set((prevItems || []).map(i => i.order_id));
    const prevOrders = prevOrderIds.size;

    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

    // Get partner product count for views estimate
    const { data: partnerData } = await supabase
        .from('shop_partners')
        .select('product_count')
        .eq('id', partnerId)
        .single();

    const productViews = (partnerData?.product_count || 0) * daysBack * 5; // placeholder estimation

    return {
        period,
        stats: {
            revenue: money(Math.round(currentRevenue * 100)), // Convert to cents
            revenue_change: Math.round(revenueChange * 10) / 10,
            orders: currentOrders,
            orders_change: Math.round(ordersChange * 10) / 10,
            product_views: productViews,
            views_change: 0,
            conversion_rate: productViews > 0 ? Math.round((currentOrders / productViews) * 10000) / 100 : 0,
        },
    };
}

export async function getPartnerTopProducts(
    partnerId: string,
    params?: { period?: string; limit?: number; metric?: string }
): Promise<{ product_id: string; title: string; image_url: string; sales_count: number; revenue: Money }[]> {
    const supabase = getSupabase();
    const limit = params?.limit || 10;

    // Get order items for this partner
    const { data: items } = await supabase
        .from('order_items')
        .select('product_id, title_snapshot, image_url_snapshot, qty, line_total')
        .eq('partner_id', partnerId);

    if (!items || items.length === 0) return [];

    // Aggregate by product
    const productMap = new Map<string, {
        product_id: string;
        title: string;
        image_url: string;
        sales_count: number;
        revenue: number;
    }>();

    for (const item of items) {
        const existing = productMap.get(item.product_id);
        if (existing) {
            existing.sales_count += item.qty;
            existing.revenue += Number(item.line_total || 0);
        } else {
            productMap.set(item.product_id, {
                product_id: item.product_id,
                title: item.title_snapshot,
                image_url: item.image_url_snapshot || '',
                sales_count: item.qty,
                revenue: Number(item.line_total || 0),
            });
        }
    }

    const sorted = Array.from(productMap.values())
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, limit);

    return sorted.map(p => ({
        ...p,
        revenue: money(Math.round(p.revenue * 100)),
    }));
}

// =============================================================================
// TEAM MANAGEMENT
// =============================================================================

export async function getPartnerTeam(partnerId: string): Promise<PartnerMember[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('shop_partner_members')
        .select('*')
        .eq('partner_id', partnerId)
        .neq('status', 'removed');

    if (error) return [];
    return (data || []) as PartnerMember[];
}

export async function inviteTeamMember(
    partnerId: string,
    invitedByUserId: string,
    data: { email: string; role?: string; permissions?: Record<string, boolean> }
) {
    const supabase = getSupabase();

    // Find user by email (from users table)
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

    if (!user) {
        throw new PartnerError('NOT_FOUND', 'User with this email not found', 404);
    }

    // Check if already a member
    const { data: existing } = await supabase
        .from('shop_partner_members')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        throw new PartnerError('ALREADY_PARTNER', 'User is already a team member', 409);
    }

    const { data: member, error } = await supabase
        .from('shop_partner_members')
        .insert({
            partner_id: partnerId,
            user_id: user.id,
            role: data.role || 'staff',
            permissions: data.permissions || { products: true, orders: true, analytics: false },
            invited_by: invitedByUserId,
            invited_at: new Date().toISOString(),
            status: 'pending',
        })
        .select('*')
        .single();

    if (error || !member) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to invite team member', 500);
    }

    return member;
}

export async function updateTeamMember(
    partnerId: string,
    memberId: string,
    data: { permissions?: Record<string, boolean> }
) {
    const supabase = getSupabase();

    const { data: updated, error } = await supabase
        .from('shop_partner_members')
        .update(data)
        .eq('id', memberId)
        .eq('partner_id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('NOT_FOUND', 'Team member not found', 404);
    }

    return updated;
}

export async function removeTeamMember(partnerId: string, memberId: string) {
    const supabase = getSupabase();

    // Cannot remove the owner
    const { data: member } = await supabase
        .from('shop_partner_members')
        .select('role')
        .eq('id', memberId)
        .eq('partner_id', partnerId)
        .single();

    if (member?.role === 'owner') {
        throw new PartnerError('FORBIDDEN', 'Cannot remove the partner owner', 403);
    }

    const { error } = await supabase
        .from('shop_partner_members')
        .update({ status: 'removed' })
        .eq('id', memberId)
        .eq('partner_id', partnerId);

    if (error) {
        throw new PartnerError('INTERNAL_ERROR', 'Failed to remove team member', 500);
    }
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

/**
 * Admin: List all partners (any status).
 */
export async function adminGetPartners(
    params?: { status?: string; limit?: number; offset?: number }
): Promise<{ data: ShopPartner[]; total: number }> {
    const supabase = getSupabase();
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    let query = supabase
        .from('shop_partners')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

    if (params?.status) {
        query = query.eq('status', params.status);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) return { data: [], total: 0 };
    return { data: (data || []) as ShopPartner[], total: count || 0 };
}

/**
 * Admin: Review a partner application (approve/reject/suspend/ban).
 */
export async function adminReviewPartner(
    partnerId: string,
    adminUserId: string,
    action: 'approve' | 'reject' | 'suspend' | 'ban',
    reason?: string
): Promise<ShopPartner> {
    const supabase = getSupabase();

    const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'banned',
        suspend: 'suspended',
        ban: 'banned',
    };

    const updateData: Record<string, unknown> = {
        status: statusMap[action],
        verified_by: adminUserId,
    };

    if (action === 'approve') {
        updateData.verified_at = new Date().toISOString();
    }

    if (reason && (action === 'reject' || action === 'suspend' || action === 'ban')) {
        updateData.rejection_reason = reason;
    }

    const { data: updated, error } = await supabase
        .from('shop_partners')
        .update(updateData)
        .eq('id', partnerId)
        .select('*')
        .single();

    if (error || !updated) {
        throw new PartnerError('NOT_FOUND', 'Partner not found', 404);
    }

    // If approved, activate the linked brand
    if (action === 'approve' && updated.brand_id) {
        await supabase
            .from('brands')
            .update({ is_active: true })
            .eq('id', updated.brand_id);
    }

    // If suspended/banned, deactivate brand and unpublish products
    if (action === 'suspend' || action === 'ban') {
        if (updated.brand_id) {
            await supabase
                .from('brands')
                .update({ is_active: false })
                .eq('id', updated.brand_id);
        }

        await supabase
            .from('shop_products')
            .update({ status: 'archived' })
            .eq('partner_id', partnerId)
            .eq('status', 'active');
    }

    // Log audit
    await supabase.from('shop_partner_audit_logs').insert({
        partner_id: partnerId,
        actor_id: adminUserId,
        action: `partner_${action}`,
        entity_type: 'partner',
        entity_id: partnerId,
        new_values: { status: statusMap[action], reason },
    });

    return updated as ShopPartner;
}
