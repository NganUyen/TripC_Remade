import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthInfo } from '@/lib/shop/utils';
import { wishlists } from '../route';

type Params = { params: Promise<{ productId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
    const { productId } = await params;
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const userWishlist = wishlists.get(userId) || [];
    const index = userWishlist.indexOf(productId);

    if (index === -1) {
        return errorResponse('NOT_IN_WISHLIST', 'Product not in wishlist', 404);
    }

    userWishlist.splice(index, 1);

    return successResponse({ success: true });
}
