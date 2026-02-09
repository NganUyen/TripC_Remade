import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, reorderProductImages, PartnerError } from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        if (partner.role === 'staff' && !partner.permissions?.products) {
            return errorResponse('FORBIDDEN', 'You do not have products permission', 403);
        }

        const { id: productId } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        if (!body.image_ids || !Array.isArray(body.image_ids)) {
            return errorResponse('VALIDATION_ERROR', 'image_ids array is required', 400);
        }

        await reorderProductImages(partner.id, productId, body.image_ids);
        return successResponse({ success: true });
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner image reorder error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to reorder images', 500);
    }
}
