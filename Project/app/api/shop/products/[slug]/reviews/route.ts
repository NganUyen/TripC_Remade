import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getProductBySlug,
    getReviews,
    paginatedResponse
} from '@/lib/shop';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);

        const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;
        const hasPhotos = searchParams.get('has_photos') === 'true';
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        const product = await getProductBySlug(slug);
        if (!product) {
            return errorResponse('PRODUCT_NOT_FOUND', `Product "${slug}" not found`, 404);
        }

        const { data: reviews, total } = await getReviews({
            productId: product.id,
            rating,
            hasPhotos,
            limit,
            offset
        });

        // Add user_name virtual field for UI (in a real app, join users table)
        const formattedReviews = reviews.map(r => ({
            ...r,
            user_name: 'Verified Customer'
        }));

        return paginatedResponse(formattedReviews, total, limit, offset);
    } catch (error) {
        console.error('Reviews API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch reviews', 500);
    }
}
