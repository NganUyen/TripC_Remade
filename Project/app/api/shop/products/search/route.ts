import { NextRequest } from 'next/server';
import {
    paginatedResponse,
    errorResponse,
    shopData,
    money
} from '@/lib/shop/utils';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!query || query.length < 2) {
        return errorResponse('INVALID_QUERY', 'Search query must be at least 2 characters', 400);
    }

    const lowerQuery = query.toLowerCase();

    // Simple text search on title and description
    const products = shopData.products
        .filter(p =>
            p.status === 'active' &&
            (p.title.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery))
        )
        .slice(0, limit);

    const formatted = products.map(p => {
        const variants = shopData.variants.filter(v => v.product_id === p.id);
        const images = shopData.images.filter(i => i.product_id === p.id);
        const primaryImage = images.find(i => i.is_primary) || images[0];
        const minPrice = Math.min(...variants.map(v => v.price));

        return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            image_url: primaryImage?.url || null,
            price_from: money(minPrice),
            rating_avg: p.rating_avg,
            review_count: p.review_count,
            is_featured: p.is_featured,
        };
    });

    return paginatedResponse(formatted, formatted.length, limit, 0);
}
