import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    getOrCreateCart,
} from '@/lib/shop';

export async function GET(request: NextRequest) {
    try {
        const { userId, sessionId } = getAuthInfo(request);
        const key = userId || sessionId;

        if (!key) {
            return errorResponse('UNAUTHORIZED', 'Missing session or auth', 401);
        }

        const cart = await getOrCreateCart(key);
        return successResponse(cart);
    } catch (error) {
        console.error('Cart GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch cart', 500);
    }
}
