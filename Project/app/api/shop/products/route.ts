import { NextRequest } from 'next/server';
import {
    paginatedResponse,
    errorResponse,
    money,
    getProducts,
    getVariantsByProductId,
    getProductImages,
} from '@/lib/shop';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');
        const category = searchParams.get('category') || undefined;
        const brand = searchParams.get('brand') || undefined;
        const featured = searchParams.get('featured') === 'true' ? true : undefined;
        const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'rating';

        // Use queries interface
        const { data: products, total } = await getProducts({
            limit,
            offset,
            category,
            brand,
            featured,
            sort,
        });

        // Format response with variants and images
        const formatted = await Promise.all(
            products.map(async (p) => {
                const variants = await getVariantsByProductId(p.id);
                const images = await getProductImages(p.id);
                const primaryImage = images.find((i) => i.is_primary) || images[0];
                const minPrice = variants.length > 0
                    ? Math.min(...variants.map((v) => v.price))
                    : 0;

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
            })
        );

        return paginatedResponse(formatted, total, limit, offset);
    } catch (error) {
        console.error('Products API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch products', 500);
    }
}
