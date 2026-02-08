import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, getPartnerTopProducts, PartnerError } from '@/lib/shop/partner-queries';
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

        if (partner.role === 'staff' && !partner.permissions?.analytics) {
            return errorResponse('FORBIDDEN', 'You do not have analytics permission', 403);
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        const metric = searchParams.get('metric') || 'sales';

        const products = await getPartnerTopProducts(partner.id, { period, limit, metric });
        return successResponse(products);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner top products GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch top products', 500);
    }
}
