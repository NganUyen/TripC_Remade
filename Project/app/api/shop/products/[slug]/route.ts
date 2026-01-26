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
} from '@/lib/shop';

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;

        // Use queries interface
        const product = await getProductBySlug(slug);

        if (!product) {
            return errorResponse('PRODUCT_NOT_FOUND', `Product "${slug}" not found`, 404);
        }

        // Fetch related data
        const [variants, images, categories, brands] = await Promise.all([
            getVariantsByProductId(product.id),
            getProductImages(product.id),
            getCategories(),
            getBrands(),
        ]);

        const category = categories.find((c) => c.id === product.category_id);
        const brand = brands.find((b) => b.id === product.brand_id);

        const response = {
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
                .filter((v) => v.is_active)
                .map((v) => ({
                    id: v.id,
                    sku: v.sku,
                    title: v.title,
                    price: money(v.price, v.currency),
                    compare_at_price: v.compare_at_price ? money(v.compare_at_price, v.currency) : null,
                    stock_on_hand: v.stock_on_hand,
                    is_active: v.is_active,
                    options: v.options,
                })),
        };

        return successResponse(response);
    } catch (error) {
        console.error('Product detail API error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch product', 500);
    }
}
