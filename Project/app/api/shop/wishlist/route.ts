import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import {
    getWishlist,
    addToWishlist,
    getProductImages,
    getVariantsByProductId
} from '@/lib/shop';
import { money } from '@/lib/shop/utils';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const products = await getWishlist(userId);

    // Format for frontend with images and prices
    const items = await Promise.all(products.map(async (product) => {
        const [images, variants] = await Promise.all([
            getProductImages(product.id),
            getVariantsByProductId(product.id)
        ]);

        const primaryImage = images.find(i => i.is_primary) || images[0];
        const minPrice = variants.length > 0
            ? Math.min(...variants.map(v => v.price))
            : 0;

        return {
            id: `wish-${product.id.slice(0, 8)}`,
            product: {
                id: product.id,
                slug: product.slug,
                title: product.title,
                image_url: primaryImage?.url || null,
                price_from: money(minPrice),
                rating_avg: product.rating_avg,
                review_count: product.review_count,
                is_featured: product.is_featured,
            },
            added_at: new Date().toISOString(),
        };
    }));

    return successResponse(items);
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
    }

    const { product_id } = body;
    if (!product_id) {
        return errorResponse('INVALID_REQUEST', 'product_id required', 400);
    }

    try {
        const productIds = await addToWishlist(userId, product_id);

        // Return updated list (simplified for now, ideally return full objects)
        return successResponse({ success: true, count: productIds.length }, { status: 201 });
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to add to wishlist', 500);
    }
}
