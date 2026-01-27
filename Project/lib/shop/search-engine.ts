import Fuse from 'fuse.js';
import { createServiceSupabaseClient } from '../supabase-server';
import { Product } from './types';

// Lightweight type for search index
interface ProductIndexItem {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    category_name: string;
    brand_name: string;
    price: number; // Lowest variant price for filtering
    rating_avg: number;
    created_at: string;
    tags: string[]; // Potential future use
}

let searchIndexCache: ProductIndexItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function getSearchIndex() {
    const now = Date.now();
    if (searchIndexCache && (now - lastCacheTime < CACHE_TTL)) {
        return searchIndexCache;
    }

    const supabase = createServiceSupabaseClient();

    // Fetch all active products with minimal necessary fields for search & key filters
    // We strictly need: title, description (for search), category/brand (for search & filter), price (filter)
    // Note: Fetching ALL might be heavy if thousands of products. For now (MVP/SMB size), it's fine.
    const { data, error } = await supabase
        .from('shop_products')
        .select(`
            id, 
            title, 
            description, 
            slug, 
            rating_avg,
            created_at,
            categories(name, slug),
            brands(name, slug),
            product_variants(price)
        `)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching search index:', error);
        return [];
    }

    // Transform to flat structure
    const index: ProductIndexItem[] = data.map((p: any) => {
        const prices = p.product_variants?.map((v: any) => v.price) || [0];
        const minPrice = prices.length ? Math.min(...prices) : 0;

        return {
            id: p.id,
            title: p.title,
            description: p.description,
            slug: p.slug,
            category_name: p.categories?.name || '',
            category_slug: p.categories?.slug || '',
            brand_name: p.brands?.name || '',
            brand_slug: p.brands?.slug || '',
            price: minPrice,
            rating_avg: p.rating_avg,
            created_at: p.created_at,
            tags: []
        };
    });

    searchIndexCache = index;
    lastCacheTime = now;
    return index;
}

interface SearchParams {
    query?: string;
    category?: string; // slug
    brand?: string; // slug
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'best_selling';
    limit?: number;
    offset?: number;
}

export async function searchProductsFuzzy(params: SearchParams) {
    const allProducts = await getSearchIndex();
    let results = allProducts;

    // 1. Fuzzy Search via Fuse.js
    if (params.query && params.query.length >= 2) {
        const fuse = new Fuse(allProducts, {
            keys: [
                { name: 'title', weight: 2 },
                { name: 'category_name', weight: 1 },
                { name: 'brand_name', weight: 1 },
                { name: 'description', weight: 0.5 }
            ],
            threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
            includeScore: true,
            ignoreLocation: true
        });

        const fuseResults = fuse.search(params.query);
        results = fuseResults.map(r => r.item);
    }

    // 2. Exact Filters
    if (params.category) {
        results = results.filter(p => (p as any).category_slug === params.category);
    }

    if (params.brand) {
        results = results.filter(p => (p as any).brand_slug === params.brand);
    }

    if (params.minPrice !== undefined) {
        results = results.filter(p => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
        results = results.filter(p => p.price <= params.maxPrice!);
    }

    if (params.minRating !== undefined) {
        results = results.filter(p => p.rating_avg >= params.minRating!);
    }

    // 3. Sorting
    if (params.sort) {
        // If sorting by relevance (and we have query), Fuse result order is already relevant. Only resort if explicit sort requested.
        // If no query, default order?

        const isRelevance = params.sort === 'relevance';
        const hasQuery = !!params.query;

        if (!isRelevance || !hasQuery) {
            results = [...results].sort((a, b) => {
                switch (params.sort) {
                    case 'newest':
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'rating':
                        return b.rating_avg - a.rating_avg;
                    default: // relevance without query or best_selling
                        return 0;
                }
            });
        }
    }

    // 4. Pagination
    const total = results.length;
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const paginatedItems = results.slice(offset, offset + limit);

    return {
        items: paginatedItems,
        total
    };
}

export async function getSuggestionsFuzzy(query: string, limit = 8) {
    const allProducts = await getSearchIndex();

    // If no query, return popular/featured or empty?
    if (!query || query.length < 2) return [];

    const fuse = new Fuse(allProducts, {
        keys: [
            { name: 'title', weight: 2 },
            { name: 'category_name', weight: 1 },
            { name: 'brand_name', weight: 1 }
        ],
        threshold: 0.4,
        ignoreLocation: true
    });

    const results = fuse.search(query).map(r => r.item).slice(0, limit);
    return results;
}
