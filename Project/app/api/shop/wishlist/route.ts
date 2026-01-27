import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import {
    getWishlist,
    addToWishlist,
    getDbUserId
} from '@/lib/shop';
import { money } from '@/lib/shop/utils';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        const products = await getWishlist(userId);

        // Format products with optimized batch loading
        const items = products.map((product: any) => ({
            id: `wish-${product.id.slice(0, 8)}`,
            product: {
                id: product.id,
                slug: product.slug,
                title: product.title,
                image_url: product.images?.[0]?.url || null,
                price_from: money(product.variants?.[0]?.price || 0),
                rating_avg: product.rating_avg,
                review_count: product.review_count,
                is_featured: product.is_featured,
            },
            added_at: product.wishlist_added_at || new Date().toISOString(),
        }));

        return successResponse(items);
    } catch (error) {
        console.error('Wishlist GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch wishlist', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
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

        const productIds = await addToWishlist(userId, product_id);
        return successResponse({ success: true, count: productIds.length }, { status: 201 });
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to add to wishlist', 500);
    }
}
