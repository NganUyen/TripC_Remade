import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getVariantsByProductId, getProductBySlug, getProductById } from '@/lib/shop';

function isUUID(str: string) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        // 1. Try resolving by slug
        let product = await getProductBySlug(slug);

        // 2. If not found and slug looks like a UUID, try by ID
        if (!product && isUUID(slug)) {
            product = await getProductById(slug);
        }

        if (!product) {
            return errorResponse('NOT_FOUND', `Product not found: ${slug}`, 404);
        }

        const variants = await getVariantsByProductId(product.id);
        return successResponse(variants);
    } catch (error: any) {
        console.error('Get Variants error:', error);
        return errorResponse('INTERNAL_ERROR', error.message || 'Failed to fetch variants', 500);
    }
}
