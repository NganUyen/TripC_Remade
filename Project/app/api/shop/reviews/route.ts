import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { getProductById, createReview, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
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

    const { product_id, order_id, rating, title, body: reviewBody } = body;

    // ... validation ...

    if (!product_id || !rating) {
        return errorResponse('INVALID_REQUEST', 'product_id and rating required', 400);
    }

    if (rating < 1 || rating > 5) {
        return errorResponse('INVALID_REQUEST', 'rating must be 1-5', 400);
    }

    const product = await getProductById(product_id);
    if (!product) {
        return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    // Call DB
    try {
        const review = await createReview({
            userId,
            productId: product_id,
            rating,
            title,
            body: reviewBody
        });
        return successResponse(review, { status: 201 });
    } catch (err: any) {
        return errorResponse('INTERNAL_ERROR', err.message || 'Failed to create review', 500);
    }
}
