// Shop Module Types
export interface Money {
    amount: number;
    currency: string;
}

export interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    product_type: 'physical' | 'digital';
    status: 'active' | 'draft' | 'archived' | 'flagged';
    rating_avg: number;
    review_count: number;
    is_featured: boolean;
    category_id: string;
    brand_id: string;
    partner_id?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    review_notes?: string | null;
    created_at: string;
    updated_at: string;
    variants: Variant[];
    images: ProductImage[];
    category?: Category;
    brand?: Brand;
}

export interface Variant {
    id: string;
    product_id: string;
    sku: string;
    title: string;
    price: number;
    compare_at_price: number | null;
    currency: string;
    stock_on_hand: number;
    is_active: boolean;
    options?: VariantOption[];
}

export interface VariantOption {
    name: string;
    value: string;
}

export interface Category {
    id: string;
    slug: string;
    name: string;
    parent_id: string | null;
    image_url: string;
    sort_order: number;
    is_active: boolean;
}

export interface Brand {
    id: string;
    slug: string;
    name: string;
    logo_url: string;
    is_active: boolean;
    tagline?: string;
    description?: string;
    cover_url?: string;
    follower_count?: number;
    rating_avg?: number;
    rating_count?: number;
    response_rate?: number;
    on_time_ship_rate?: number;
    product_count?: number;
    joined_date?: string;
    response_time?: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    alt: string;
    sort_order: number;
    is_primary: boolean;
}

export interface ShippingMethod {
    id: string;
    code: string;
    title: string;
    description: string;
    base_fee: number;
    currency: string;
    estimated_days_min: number;
    estimated_days_max: number;
    is_active: boolean;
}

export interface Coupon {
    id: string;
    code: string;
    title: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    min_order_subtotal: number;
    starts_at: string | null;
    ends_at: string | null;
    usage_limit_total: number | null;
    usage_limit_per_user: number;
    current_usage_count: number;
    status: 'active' | 'inactive';
}

export interface VoucherTemplate {
    id: string;
    title: string;
    description: string;
    tcent_cost: number;
    discount_mode: 'fixed' | 'percent';
    discount_value: number;
    currency: string;
    min_spend_threshold: number;
    total_inventory: number;
    redeemed_count: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    validity_days: number;
}

export interface CartItem {
    id: string;
    variant_id: string;
    qty: number;
    unit_price: Money;
    line_total: Money;
    title_snapshot: string;
    variant_snapshot: Record<string, string>;
    image?: string | null;
}

export interface Cart {
    id: string;
    status: 'active' | 'converted' | 'abandoned';
    currency: string;
    items: CartItem[];
    subtotal: Money;
    discount_total: Money;
    shipping_total: Money;
    grand_total: Money;
    item_count: number;
    coupon_code: string | null;
}

export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    currency: string;
    subtotal: Money;
    discount_total: Money;
    shipping_total: Money;
    grand_total: Money;
    items?: CartItem[];
    shipping_address_id?: string;
    shipping_method_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Address {
    id: string;
    user_id: string;
    label: string;
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country_code: string;
    is_default: boolean;
}

export interface UserVoucher {
    id: string;
    template_id: string;
    user_id: string;
    status: 'active' | 'used' | 'expired';
    expires_at: string;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    title: string;
    body: string;
    photos?: string[];
    is_verified_purchase?: boolean;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user_name?: string; // Virtual field for UI
}

export interface ReviewSummary {
    rating_avg: number;
    review_count: number;
    rating_distribution: {
        [key: number]: number; // 1-5
    };
}

// Mock Data Interface
export interface ShopMockData {
    products: Product[];
    variants: Variant[];
    images: ProductImage[];
    categories: Category[];
    brands: Brand[];
    shipping_methods: ShippingMethod[];
    coupons: Coupon[];
    voucher_templates: VoucherTemplate[];
    addresses?: Address[];
}

// =============================================================================
// PARTNER / VENDOR TYPES
// =============================================================================

export type PartnerStatus = 'pending' | 'approved' | 'suspended' | 'banned';
export type PartnerBusinessType = 'individual' | 'business' | 'enterprise';
export type PartnerMemberRole = 'owner' | 'staff';
export type PartnerMemberStatus = 'pending' | 'active' | 'removed';

export interface ShopPartner {
    id: string;
    slug: string;
    business_name: string;
    display_name: string | null;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    email: string;
    phone: string | null;
    website: string | null;
    business_type: PartnerBusinessType;
    business_registration_number: string | null;
    tax_id: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state_province: string | null;
    postal_code: string | null;
    country_code: string;
    status: PartnerStatus;
    verified_at: string | null;
    rejection_reason: string | null;
    brand_id: string | null;
    product_count: number;
    order_count: number;
    total_sales_cents: number;
    rating_avg: number;
    rating_count: number;
    follower_count: number;
    commission_rate: number;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PartnerMemberPermissions {
    products: boolean;
    orders: boolean;
    analytics: boolean;
}

export interface PartnerMember {
    id: string;
    partner_id: string;
    user_id: string;
    role: PartnerMemberRole;
    permissions: PartnerMemberPermissions;
    status: PartnerMemberStatus;
    invited_by: string | null;
    invited_at: string | null;
    accepted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PartnerWithMembership extends ShopPartner {
    role: PartnerMemberRole;
    permissions: PartnerMemberPermissions;
}

export interface PartnerProduct extends Product {
    sales_count?: number;
    stock_total?: number;
}

export interface PartnerOrderItem {
    id: string;
    product_id: string;
    product_title: string;
    variant_id: string;
    variant_title: string;
    qty: number;
    unit_price: Money;
    line_total: Money;
    image_url?: string;
}

export interface PartnerOrder {
    id: string;
    order_number: string;
    status: string;
    customer_name: string;
    item_count: number;
    partner_subtotal: Money;
    items: PartnerOrderItem[];
    shipping_address?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    period: string;
    stats: {
        revenue: Money;
        revenue_change: number;
        orders: number;
        orders_change: number;
        product_views: number;
        views_change: number;
        conversion_rate: number;
    };
    chart?: {
        labels: string[];
        revenue: number[];
        orders: number[];
    };
}

export interface PartnerApplicationData {
    business_name: string;
    display_name?: string;
    business_type: PartnerBusinessType;
    email: string;
    phone?: string;
    website?: string;
    address_line1?: string;
    city?: string;
    country_code?: string;
    description?: string;
    business_registration_number?: string;
    tax_id?: string;
    // Certificate uploads (URLs — placeholder for AI verification)
    certificate_urls?: string[];
}
