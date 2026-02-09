import { NextRequest } from 'next/server';
import { errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, deleteProductImage, PartnerError } from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
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

        const { id: productId, imageId } = await params;

        await deleteProductImage(partner.id, productId, imageId);
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner image DELETE error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to delete image', 500);
    }
}
