import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getVariantsByProductId, getProductBySlug } from '@/lib/shop';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        // Resolve slug to product first
        const product = await getProductBySlug(params.slug);

        if (!product) {
            return errorResponse('NOT_FOUND', 'Product not found', 404);
        }

        const variants = await getVariantsByProductId(product.id);
        return successResponse(variants);
    } catch (error) {
        console.error('Get Variants error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch variants', 500);
    }
}
