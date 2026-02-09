import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import {
    getPartnerMembership,
    requirePartnerAccess,
    updatePartnerProfile,
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

        const partner = await getPartnerMembership(userId);
        if (!partner) {
            return errorResponse('NOT_PARTNER', 'User is not a partner', 404);
        }

        return successResponse(partner);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner me GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch partner profile', 500);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        const partner = await requirePartnerAccess(userId, 'owner');

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        // Only allow specific fields to be updated
        const allowedFields = ['display_name', 'description', 'logo_url', 'cover_url', 'phone', 'website'];
        const updateData: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updateData[key] = body[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return errorResponse('VALIDATION_ERROR', 'No valid fields to update', 400);
        }

        const updated = await updatePartnerProfile(partner.id, updateData as any);
        return successResponse(updated);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Partner me PATCH error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to update partner profile', 500);
    }
}
