import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { adminReviewPartner, PartnerError } from '@/lib/shop/partner-queries';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['approve', 'reject', 'suspend', 'ban'] as const;

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

        // TODO: Add admin role check via user metadata or a roles table
        // For now, all authenticated users can access (should be locked down)

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const { partner_id, action, reason } = body;

        if (!partner_id) {
            return errorResponse('VALIDATION_ERROR', 'partner_id is required', 400);
        }

        if (!action || !VALID_ACTIONS.includes(action)) {
            return errorResponse('VALIDATION_ERROR', `action must be one of: ${VALID_ACTIONS.join(', ')}`, 400);
        }

        const partner = await adminReviewPartner(partner_id, userId, action, reason);
        return successResponse(partner);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Admin review error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to review partner', 500);
    }
}
