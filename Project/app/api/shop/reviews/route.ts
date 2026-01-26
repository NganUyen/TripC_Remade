import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    shopData
} from '@/lib/shop/utils';

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

    const { product_id, order_id, rating, title, body: reviewBody } = body;

    if (!product_id || !rating) {
        return errorResponse('INVALID_REQUEST', 'product_id and rating required', 400);
    }

    if (rating < 1 || rating > 5) {
        return errorResponse('INVALID_REQUEST', 'rating must be 1-5', 400);
    }

    const product = shopData.products.find(p => p.id === product_id);
    if (!product) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    const review = {
        id: `review-${crypto.randomUUID().slice(0, 8)}`,
        product_id,
        rating,
        title: title || null,
        body: reviewBody || null,
        is_verified_purchase: !!order_id,
        status: 'pending', // Reviews require moderation
        created_at: new Date().toISOString(),
    };

    return successResponse(review, { status: 201 });
}
