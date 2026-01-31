/**
 * Shop API Hooks
 * 
 * Custom hooks for interacting with the Shop API.
 * Provides data fetching, caching, and state management for shop features.
 */

import { useState, useEffect } from 'react';

// ============================================================================
// API Base URL
// ============================================================================

const API_BASE = '/api/shop';

// ============================================================================
// Types (matching backend response shapes)
// ============================================================================

export interface Money {
    amount: number;
    currency: string;
}

export interface ProductListItem {
    id: string;
    slug: string;
    title: string;
    image_url: string | null;
    price_from: Money;
    rating_avg: number;
    review_count: number;
    is_featured: boolean;
}

export interface ProductVariant {
    id: string;
    sku: string;
    title: string;
    price: Money;
    compare_at_price: Money | null;
    stock_on_hand: number;
    is_active: boolean;
    options: { name: string; value: string }[];
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
    user_name?: string;
}

export interface ReviewSummary {
    rating_avg: number;
    review_count: number;
    rating_distribution: {
        [key: number]: number;
    };
}

export interface ProductDetail {
    id: string;
    slug: string;
    title: string;
    description: string;
    product_type: string;
    status: string;
    rating_avg: number;
    review_count: number;
    is_featured: boolean;
    category: { id: string; slug: string; name: string } | null;
    brand: {
        id: string;
        slug: string;
        name: string;
        logo_url?: string;
        tagline?: string;
        follower_count?: number;
        rating_avg?: number;
        response_rate?: number;
        on_time_ship_rate?: number;
    } | null;
    images: { id: string; url: string; alt: string; is_primary: boolean }[];
    variants: ProductVariant[];
    reviews?: Review[];
}

export interface CartItem {
    id: string;
    variant_id: string;
    qty: number;
    unit_price: Money;
    line_total: Money;
    title_snapshot: string;
    variant_snapshot: Record<string, string>;
}

export interface Cart {
    id: string;
    status: string;
    currency: string;
    items: CartItem[];
    subtotal: Money;
    discount_total: Money;
    shipping_total: Money;
    grand_total: Money;
    item_count: number;
    coupon_code: string | null;
}

export interface Category {
    id: string;
    slug: string;
    name: string;
    parent_id: string | null;
    image_url: string;
    sort_order: number;
    is_active: boolean;
    children?: Category[];
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

export interface VoucherTemplate {
    id: string;
    title: string;
    description: string;
    tcent_cost: number;
    discount_mode: string;
    discount_value: number;
    currency: string;
    min_spend_threshold: number;
}

// ============================================================================
// API Client Functions
// ============================================================================

async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const json = await response.json();

        if (!response.ok) {
            return { data: null, error: json.error?.message || 'Request failed' };
        }

        return { data: json.data, error: null };
    } catch (error) {
        return { data: null, error: 'Network error' };
    }
}

// ============================================================================
// API Functions
// ============================================================================

export const shopApi = {
    // Products
    async getProducts(params?: {
        limit?: number;
        offset?: number;
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        featured?: boolean;
        sort?: string;
        q?: string; // Add query support here too
    }): Promise<{ data: ProductListItem[]; total: number; error: string | null }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.category) query.set('category', params.category);
        if (params?.brand) query.set('brand', params.brand);
        if (params?.minPrice) query.set('min_price', String(params.minPrice));
        if (params?.maxPrice) query.set('max_price', String(params.maxPrice));
        if (params?.minRating) query.set('min_rating', String(params.minRating));
        if (params?.featured) query.set('featured', 'true');
        if (params?.sort) query.set('sort', params.sort);
        if (params?.q) query.set('q', params.q);

        const endpoint = params?.q ? '/products/search' : '/products';
        const response = await fetch(`${API_BASE}${endpoint}?${query}`);
        const json = await response.json();

        if (!response.ok) {
            return { data: [], total: 0, error: json.error?.message || 'Failed to fetch' };
        }

        return { data: json.data || [], total: json.meta?.total || 0, error: null };
    },

    async getProduct(slug: string): Promise<{ data: ProductDetail | null; error: string | null }> {
        return fetchApi<ProductDetail>(`/products/${slug}`);
    },

    async searchProducts(query: string, limit = 10): Promise<{ data: ProductListItem[]; error: string | null }> {
        const response = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        const json = await response.json();
        return { data: json.data || [], error: null };
    },

    async getVariants(slug: string): Promise<{ data: ProductVariant[]; error: string | null }> {
        const result = await fetchApi<ProductVariant[]>(`/products/${slug}/variants`);
        return { data: result.data || [], error: result.error };
    },

    // Categories
    async getCategories(): Promise<{ data: Category[]; error: string | null }> {
        const result = await fetchApi<Category[]>('/categories');
        return { data: result.data || [], error: result.error };
    },

    // Vouchers
    async getVouchers(): Promise<{ data: VoucherTemplate[]; error: string | null }> {
        const result = await fetchApi<VoucherTemplate[]>('/vouchers/available');
        return { data: result.data || [], error: result.error };
    },

    // Brands
    async getBrands(): Promise<{ data: Brand[]; error: string | null }> {
        const result = await fetchApi<Brand[]>('/brands');
        return { data: result.data || [], error: result.error };
    },

    // Reviews
    async getReviews(slug: string, params?: {
        rating?: number;
        has_photos?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{ data: Review[]; total: number; error: string | null }> {
        const query = new URLSearchParams();
        if (params?.rating) query.set('rating', String(params.rating));
        if (params?.has_photos) query.set('has_photos', 'true');
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));

        const response = await fetch(`${API_BASE}/products/${slug}/reviews?${query}`);
        const json = await response.json();

        if (!response.ok) {
            return { data: [], total: 0, error: json.error?.message || 'Failed to fetch' };
        }

        return { data: json.data || [], total: json.meta?.total || 0, error: null };
    },

    async getReviewsSummary(slug: string): Promise<{ data: ReviewSummary | null; error: string | null }> {
        return fetchApi<ReviewSummary>(`/products/${slug}/reviews/summary`);
    },
};

// ============================================================================
// React Hooks
// ============================================================================

export function useProducts(params?: Parameters<typeof shopApi.getProducts>[0]) {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            setLoading(true);
            const result = await shopApi.getProducts(params);

            if (!cancelled) {
                setProducts(result.data);
                setTotal(result.total);
                setError(result.error);
                setLoading(false);
            }
        }

        fetchProducts();

        return () => { cancelled = true; };
    }, [params?.limit, params?.offset, params?.category, params?.brand, params?.minPrice, params?.maxPrice, params?.minRating, params?.featured, params?.sort, params?.q]);

    return { products, total, loading, error };
}

export function useProduct(slug: string) {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchProduct() {
            setLoading(true);
            const result = await shopApi.getProduct(slug);

            if (!cancelled) {
                setProduct(result.data);
                setError(result.error);
                setLoading(false);
            }
        }

        if (slug) fetchProduct();

        return () => { cancelled = true; };
    }, [slug]);

    return { product, loading, error };
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchCategories() {
            const result = await shopApi.getCategories();

            if (!cancelled) {
                setCategories(result.data || []);
                setError(result.error);
                setLoading(false);
            }
        }

        fetchCategories();

        return () => { cancelled = true; };
    }, []);

    return { categories, loading, error };
}

export function useVouchers() {
    const [vouchers, setVouchers] = useState<VoucherTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchVouchers() {
            const result = await shopApi.getVouchers();

            if (!cancelled) {
                setVouchers(result.data || []);
                setError(result.error);
                setLoading(false);
            }
        }

        fetchVouchers();

        return () => { cancelled = true; };
    }, []);

    return { vouchers, loading, error };
}

export function useBrands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchBrands() {
            const result = await shopApi.getBrands();

            if (!cancelled) {
                setBrands(result.data || []);
                setError(result.error);
                setLoading(false);
            }
        }

        fetchBrands();

        return () => { cancelled = true; };
    }, []);

    return { brands, loading, error };
}

export function useReviews(slug: string, params?: Parameters<typeof shopApi.getReviews>[1]) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchReviews() {
            setLoading(true);
            const result = await shopApi.getReviews(slug, params);

            if (!cancelled) {
                setReviews(result.data);
                setTotal(result.total);
                setError(result.error);
                setLoading(false);
            }
        }

        if (slug) fetchReviews();

        return () => { cancelled = true; };
    }, [slug, params?.rating, params?.has_photos, params?.limit, params?.offset]);

    return { reviews, total, loading, error };
}

export function useReviewsSummary(slug: string) {
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchSummary() {
            setLoading(true);
            const result = await shopApi.getReviewsSummary(slug);

            if (!cancelled) {
                setSummary(result.data);
                setError(result.error);
                setLoading(false);
            }
        }

        if (slug) fetchSummary();

        return () => { cancelled = true; };
    }, [slug]);

    return { summary, loading, error };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatPrice(money: Money): string {
    const amount = money.amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: money.currency,
    }).format(amount);
}

export function formatPriceSimple(amount: number): number {
    return amount;
}
