import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    shopData,
    money
} from '@/lib/shop/utils';

// In-memory wishlist
const wishlists: Map<string, string[]> = new Map();

export async function GET(request: NextRequest) {
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const productIds = wishlists.get(userId) || [];

    const items = productIds.map(productId => {
        const product = shopData.products.find(p => p.id === productId);
        if (!product) return null;

        const variants = shopData.variants.filter(v => v.product_id === productId);
        const image = shopData.images.find(i => i.product_id === productId && i.is_primary);
        const minPrice = Math.min(...variants.map(v => v.price));

        return {
            id: `wish-${productId.slice(0, 8)}`,
            product: {
                id: product.id,
                slug: product.slug,
                title: product.title,
                image_url: image?.url || null,
                price_from: money(minPrice),
                rating_avg: product.rating_avg,
                review_count: product.review_count,
                is_featured: product.is_featured,
            },
            added_at: new Date().toISOString(),
        };
    }).filter(Boolean);

    return successResponse(items);
}

export async function POST(request: NextRequest) {
    const { userId } = getAuthInfo(request);

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

    const product = shopData.products.find(p => p.id === product_id);
    if (!product) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    if (!wishlists.has(userId)) {
        wishlists.set(userId, []);
    }

    const userWishlist = wishlists.get(userId)!;
    if (userWishlist.includes(product_id)) {
        return errorResponse('ALREADY_IN_WISHLIST', 'Product already in wishlist', 409);
    }

    userWishlist.push(product_id);

    // Return updated wishlist
    const items = userWishlist.map(pid => {
        const p = shopData.products.find(pr => pr.id === pid);
        if (!p) return null;

        const variants = shopData.variants.filter(v => v.product_id === pid);
        const image = shopData.images.find(i => i.product_id === pid && i.is_primary);
        const minPrice = Math.min(...variants.map(v => v.price));

        return {
            id: `wish-${pid.slice(0, 8)}`,
            product: {
                id: p.id,
                slug: p.slug,
                title: p.title,
                image_url: image?.url || null,
                price_from: money(minPrice),
                rating_avg: p.rating_avg,
                review_count: p.review_count,
                is_featured: p.is_featured,
            },
            added_at: new Date().toISOString(),
        };
    }).filter(Boolean);

    return successResponse(items, { status: 201 });
}

export { wishlists };
