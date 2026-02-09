import { NextRequest } from 'next/server';
import { successResponse, paginatedResponse, errorResponse, getDbUserId } from '@/lib/shop';
import {
    requirePartnerAccess,
    getPartnerProducts,
    createPartnerProduct,
    PartnerError,
} from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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

        const partner = await requirePartnerAccess(userId);

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;
        const search = searchParams.get('search') || undefined;
        const sort = searchParams.get('sort') || undefined;

        const { data, total } = await getPartnerProducts(partner.id, {
            limit,
            offset,
            status,
            search,
            sort,
        });

        return paginatedResponse(data, total, limit, offset);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner products GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch products', 500);
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

        const partner = await requirePartnerAccess(userId);

        // Check products permission for staff
        if (partner.role === 'staff' && !partner.permissions?.products) {
            return errorResponse('FORBIDDEN', 'You do not have products permission', 403);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        if (!body.title) {
            return errorResponse('VALIDATION_ERROR', 'title is required', 400);
        }

        // BUG-001 Fix: Validate category_id is a valid UUID format if provided
        if (body.category_id) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(body.category_id.trim())) {
                return errorResponse('VALIDATION_ERROR', 'category_id must be a valid UUID format', 400);
            }
            body.category_id = body.category_id.trim(); // Also trim whitespace
        }

        const product = await createPartnerProduct(partner.id, body);
        return successResponse(product, undefined, 201);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner products POST error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to create product', 500);
    }
}
