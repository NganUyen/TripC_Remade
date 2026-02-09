import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getDbUserId } from '@/lib/shop';
import { requirePartnerAccess, PartnerError } from '@/lib/shop/partner-queries';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

        const { product_id, filename, content_type, file_size } = body;

        if (!product_id || !filename || !content_type) {
            return errorResponse('VALIDATION_ERROR', 'product_id, filename, and content_type are required', 400);
        }

        if (!ALLOWED_TYPES.includes(content_type)) {
            return errorResponse('INVALID_FILE_TYPE', `Allowed types: ${ALLOWED_TYPES.join(', ')}`, 400);
        }

        if (file_size && file_size > MAX_FILE_SIZE) {
            return errorResponse('FILE_TOO_LARGE', 'File must be under 5MB', 400);
        }

        // Generate storage key
        const ext = filename.split('.').pop() || 'jpg';
        const imageId = crypto.randomUUID();
        const key = `${partner.id}/products/${product_id}/${imageId}.${ext}`;

        // Create signed upload URL using Supabase storage
        // BUG-003 Fix: Changed bucket name from 'shop-images' to 'shop-products' to match docs
        const supabase = createServiceSupabaseClient();
        const { data, error } = await supabase.storage
            .from('shop-products')
            .createSignedUploadUrl(key);

        if (error || !data) {
            console.error('Upload URL error:', error);
            return errorResponse('INTERNAL_ERROR', 'Failed to create upload URL', 500);
        }

        return successResponse({
            upload_url: data.signedUrl,
            key,
            expires_in: 3600,
        });
    } catch (error) {
        if (error instanceof PartnerError) {
            return errorResponse(error.code, error.message, error.status, error.details);
        }
        console.error('Upload request error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to request upload URL', 500);
    }
}
