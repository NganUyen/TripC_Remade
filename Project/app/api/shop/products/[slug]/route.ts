import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    money,
    getProductBySlug,
    getVariantsByProductId,
    getProductImages,
    getCategories,
    getBrands,
    getReviewsByProductId,
} from '@/lib/shop';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;

        // Use queries interface
        const product = await getProductBySlug(slug);

        if (product) {
            const vars = await getVariantsByProductId(product.id);
        }

        if (!product) {
            return errorResponse('PRODUCT_NOT_FOUND', `Product "${slug}" not found`, 404);
        }

        // Fetch related data
        const [variants, images, categories, brands, reviews] = await Promise.all([
            getVariantsByProductId(product.id),
            getProductImages(product.id),
            getCategories(),
            getBrands(),
            getReviewsByProductId(product.id), // Added reviews fetch
        ]);

        const category = categories.find((c) => c.id === product.category_id);
        let brand = brands.find((b) => b.id === product.brand_id);

        // For partner products: fetch partner info and use as brand if no brand exists
        let partnerInfo = null;

        if (product.partner_id) {
            const { createServiceSupabaseClient } = await import('@/lib/supabase-server');
            const supabase = createServiceSupabaseClient();
            const { data: partner } = await supabase
                .from('shop_partners')
                .select('id, display_name, logo_url, description')
                .eq('id', product.partner_id)
                .single();

            if (partner) {
                partnerInfo = partner;
                // If no brand, create a brand-like object from partner info (no mocked values)
                if (!brand) {
                    brand = {
                        id: partner.id,
                        slug: `partner-${partner.id.slice(0, 8)}`,
                        name: partner.display_name || 'Partner Store',
                        logo_url: partner.logo_url || null,
                        is_active: true,
                        tagline: partner.description || null,
                        description: partner.description || null,
                        follower_count: null,
                        rating_avg: null,
                        response_rate: null,
                        on_time_ship_rate: null,
                    } as any;
                    console.log('[Product API] Created brand from partner:', brand);
                }
            }
        }

        // Format response
        return successResponse({
            id: product.id,
            slug: product.slug,
            title: product.title,
            description: product.description,
            product_type: product.product_type,
            status: product.status,
            rating_avg: product.rating_avg,
            review_count: product.review_count,
            is_featured: product.is_featured,
            category: category
                ? {
                    id: category.id,
                    slug: category.slug,
                    name: category.name,
                    parent_id: category.parent_id,
                }
                : null,
            brand: brand
                ? {
                    id: brand.id,
                    slug: brand.slug,
                    name: brand.name,
                    logo_url: brand.logo_url,
                    tagline: (brand as any).tagline,
                    follower_count: (brand as any).follower_count,
                    rating_avg: (brand as any).rating_avg,
                    response_rate: (brand as any).response_rate,
                    on_time_ship_rate: (brand as any).on_time_ship_rate,
                }
                : null,
            images: images
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((i) => ({
                    id: i.id,
                    url: i.url,
                    alt: i.alt,
                    is_primary: i.is_primary,
                })),
            variants: variants
                .map((v) => ({ // Removed .filter((v) => v.is_active)
                    id: v.id,
                    sku: v.sku,
                    title: v.title,
                    price: money(v.price), // Removed currency argument
                    compare_at_price: v.compare_at_price ? money(v.compare_at_price) : null, // Removed currency argument
                    stock_on_hand: v.stock_on_hand,
                    is_active: v.is_active,
                    options: v.options,
                })),
            reviews: reviews.slice(0, 5).map(r => ({ // Added reviews
                id: r.id,
                user_id: r.user_id,
                rating: r.rating,
                title: r.title,
                body: r.body,
                created_at: r.created_at,
                user_name: 'Verified Customer' // Mock name for now as we don't have user profiles public
            }))
        });
    } catch (error) {
        console.error('Product detail API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch product', 500);
    }
}
