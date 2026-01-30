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
    status: 'active' | 'draft' | 'archived';
    rating_avg: number;
    review_count: number;
    is_featured: boolean;
    category_id: string;
    brand_id: string;
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
    price: Float16Array;
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
    follower_count?: number;
    rating_avg?: number;
    response_rate?: number;
    on_time_ship_rate?: number;
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
