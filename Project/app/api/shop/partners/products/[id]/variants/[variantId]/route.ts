import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, updateVariant, deleteVariant, PartnerError } from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; variantId: string }> }
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

        const { id: productId, variantId } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const updated = await updateVariant(partner.id, productId, variantId, body);
        return successResponse(updated);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner variant PATCH error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to update variant', 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; variantId: string }> }
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

        const { id: productId, variantId } = await params;

        await deleteVariant(partner.id, productId, variantId);
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner variant DELETE error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to delete variant', 500);
    }
}
