import { NextRequest } from 'next/server';
import { paginatedResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, getPartnerOrders, PartnerError } from '@/lib/shop/partner-queries';
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

        if (partner.role === 'staff' && !partner.permissions?.orders) {
            return errorResponse('FORBIDDEN', 'You do not have orders permission', 403);
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;
        const from = searchParams.get('from') || undefined;
        const to = searchParams.get('to') || undefined;

        const { data, total } = await getPartnerOrders(partner.id, {
            limit,
            offset,
            status,
            from,
            to,
        });

        return paginatedResponse(data, total, limit, offset);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner orders GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch orders', 500);
    }
}
