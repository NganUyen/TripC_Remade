import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/shop';
import { getPartnerBySlug } from '@/lib/shop/partner-queries';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return errorResponse('VALIDATION_ERROR', 'Partner slug is required', 400);
        }

        const partner = await getPartnerBySlug(slug);
        if (!partner) {
            return errorResponse('NOT_FOUND', 'Partner not found', 404);
        }

        // Return public profile subset
        return successResponse({
            id: partner.id,
            slug: partner.slug,
            display_name: partner.display_name,
            description: partner.description,
            logo_url: partner.logo_url,
            cover_url: partner.cover_url,
            product_count: partner.product_count,
            rating_avg: partner.rating_avg,
            rating_count: partner.rating_count,
            follower_count: partner.follower_count,
        });
    } catch (error) {
        console.error('Partner slug GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch partner profile', 500);
    }
}
