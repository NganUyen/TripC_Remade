import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, getPartnerOrderById, PartnerError } from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(
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

        if (partner.role === 'staff' && !partner.permissions?.orders) {
            return errorResponse('FORBIDDEN', 'You do not have orders permission', 403);
        }

        const { id } = await params;
        const order = await getPartnerOrderById(partner.id, id);

        if (!order) {
            return errorResponse('NOT_FOUND', 'Order not found', 404);
        }

        return successResponse(order);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner order GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch order', 500);
    }
}
