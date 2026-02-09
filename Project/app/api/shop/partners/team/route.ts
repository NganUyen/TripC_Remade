import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, getPartnerTeam, PartnerError } from '@/lib/shop/partner-queries';
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
        const team = await getPartnerTeam(partner.id);

        return successResponse(team);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner team GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch team', 500);
    }
}
