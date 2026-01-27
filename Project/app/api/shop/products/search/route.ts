import { NextRequest } from 'next/server';
import {
    paginatedResponse,
    errorResponse,
    successResponse,
    money
} from '@/lib/shop/utils';
import { getProductImages, getVariantsByProductId } from '@/lib/shop';
import { searchProductsFuzzy, getSuggestionsFuzzy } from '@/lib/shop/search-engine';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const mode = searchParams.get('mode'); // 'normal' | 'suggest'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const sort = searchParams.get('sort') as any || 'relevance';

    // Min query length check only if explicit query is present
    if (query && query.length < 2) {
        if (mode === 'suggest') return successResponse([]);
        // Allowing empty query if filtering by category e.g.
        if (!category) {
            return errorResponse('INVALID_QUERY', 'Search query must be at least 2 characters', 400);
        }
    }

    try {
        if (mode === 'suggest') {
            // Using Fuse.js for fuzzy suggestions (Hero Search)
            const suggestions = await getSuggestionsFuzzy(query || '', 8);

            // Format for frontend suggestion dropdown
            // Note: search-engine index already has price (min price of variants)
            const formatted = await Promise.all(suggestions.map(async (p) => {
                const images = await getProductImages(p.id);
                const primaryImage = images.find(i => i.is_primary) || images[0];

                return {
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    image_url: primaryImage?.url || null,
                    price_from: money(p.price),
                    category: p.category_name || 'Product'
                };
            }));

            return successResponse(formatted);
        }

        // Full Search (Fuzzy)
        const { items: rawProducts, total } = await searchProductsFuzzy({
            query: query || undefined,
            category,
            minPrice,
            maxPrice,
            sort,
            limit,
            offset
        });

        const enriched = await Promise.all(rawProducts.map(async (p) => {
            const [images, variants] = await Promise.all([
                getProductImages(p.id),
                getVariantsByProductId(p.id)
            ]);

            const primaryImage = images.find(i => i.is_primary) || images[0];
            const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;

            return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                image_url: primaryImage?.url || null,
                price_from: money(minPrice),
                rating_avg: p.rating_avg,
                review_count: 0, // lightweight index might not have this, or we add it to index
                is_featured: false, // add to index if needed
                brand: (p as any).brand_name // Passed from index
            };
        }));

        return paginatedResponse(enriched, total, limit, offset);

    } catch (error) {
        console.error('Search API Error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to search products', 500);
    }
}
