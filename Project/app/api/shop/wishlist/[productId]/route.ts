import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { removeFromWishlist, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

type Params = { params: Promise<{ productId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
    const { productId } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
        return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
    }

    try {
        await removeFromWishlist(userId, productId);
        return successResponse({ success: true });
    } catch (error) {
        return errorResponse('DELETE_FAILED', 'Failed to remove from wishlist', 500);
    }
}
