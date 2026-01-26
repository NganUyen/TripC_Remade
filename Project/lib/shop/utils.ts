/**
 * Shop Utilities
 * 
 * Shared utilities for shop module API routes.
 * Separated from API routes for better organization and testability.
 */

import { NextResponse } from 'next/server';
import type { Money, Cart } from './types';

// Re-export stores from mock (single source of truth)
export {
    carts,
    orders,
    wishlists,
    userVouchers,
    couponUsages,
    reviews,
    mockQueries,
    shopData,
    generateOrderNumber
} from '../mock/shop';

// ============================================================================
// Response Helpers
// ============================================================================

export function generateRequestId(): string {
    return crypto.randomUUID();
}

export function money(amount: number, currency = 'USD'): Money {
    return { amount, currency };
}

export function successResponse<T>(data: T, meta?: Record<string, any>, status?: number) {
    return NextResponse.json({
        data,
        meta: {
            request_id: generateRequestId(),
            ...meta,
        },
    }, status ? { status } : undefined);
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number
) {
    return NextResponse.json({
        data,
        meta: {
            total,
            limit,
            offset,
            has_more: offset + data.length < total,
            request_id: generateRequestId(),
        },
    });
}

export function errorResponse(
    code: string,
    message: string,
    status: number,
    details?: Record<string, any>
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                details: details || {},
            },
        },
        { status }
    );
}

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Extract auth info from request
 * 
 * DEVELOPMENT: Returns mock userId
 * PRODUCTION: Replace with Clerk auth()
 */
export function getAuthInfo(request: Request): {
    userId: string | null;
    sessionId: string | null;
} {
    const authHeader = request.headers.get('authorization');
    const sessionId = request.headers.get('x-session-id');

    // TODO: Replace with Clerk integration
    let userId = null;
    if (authHeader?.startsWith('Bearer ')) {
        userId = 'mock-user-uuid'; // Mock user
    }

    return { userId, sessionId };
}

// ============================================================================
// Cart Helpers (using mock stores)
// ============================================================================

import { mockQueries as mq } from '../mock/shop';

export function getOrCreateCart(sessionId: string | null, userId: string | null): Cart {
    const key = userId || sessionId || 'guest';
    return mq.cart.getOrCreate(key);
}

export function recalculateCart(cart: Cart): void {
    mq.cart.recalculate(cart);
}
