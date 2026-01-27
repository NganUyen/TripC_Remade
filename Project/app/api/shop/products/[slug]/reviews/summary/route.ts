import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getProductBySlug,
    getReviewsSummary
} from '@/lib/shop';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;

        const product = await getProductBySlug(slug);
        if (!product) {
            return errorResponse('PRODUCT_NOT_FOUND', `Product "${slug}" not found`, 404);
        }

        const summary = await getReviewsSummary(product.id);

        return successResponse(summary);
    } catch (error) {
        console.error('Reviews Summary API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch reviews summary', 500);
    }
}
