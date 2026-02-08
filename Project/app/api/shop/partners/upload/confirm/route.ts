import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, addProductImage, PartnerError } from '@/lib/shop/partner-queries';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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

        const partner = await requirePartnerAccess(userId);

        if (partner.role === 'staff' && !partner.permissions?.products) {
            return errorResponse('FORBIDDEN', 'You do not have products permission', 403);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
        }

        const { key, product_id, alt, is_primary } = body;

        if (!key || !product_id) {
            return errorResponse('VALIDATION_ERROR', 'key and product_id are required', 400);
        }

        // Get the public URL for the uploaded file
        // BUG-003 Fix: Changed bucket name from 'shop-images' to 'shop-products' to match docs
        const supabase = createServiceSupabaseClient();
        const { data: urlData } = supabase.storage
            .from('shop-products')
            .getPublicUrl(key);

        const url = urlData?.publicUrl;
        if (!url) {
            return errorResponse('INTERNAL_ERROR', 'Failed to get public URL', 500);
        }

        // Add image record to database
        const image = await addProductImage(partner.id, product_id, {
            url,
            alt: alt || '',
            is_primary: is_primary || false,
        });

        return successResponse(image, undefined, 201);
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Upload confirm error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to confirm upload', 500);
    }
}
