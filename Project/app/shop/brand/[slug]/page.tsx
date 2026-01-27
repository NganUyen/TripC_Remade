import { notFound } from 'next/navigation'
import { getBrandBySlug, getProducts } from '@/lib/shop/queries'
import { BrandClientView } from '@/components/shop/brand/ClientView'
import { Metadata } from 'next'

// Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const normalizedParams = await params
    const brand = await getBrandBySlug(normalizedParams.slug)

    if (!brand) return { title: 'Brand Not Found' }

    return {
        title: `${brand.name} Official Store | TripC`,
        description: brand.tagline || `Shop the best products from ${brand.name} on TripC.`,
        openGraph: {
            images: brand.logo_url ? [brand.logo_url] : [],
        }
    }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const normalizedParams = await params
    const { slug } = normalizedParams

    // Fetch Data
    const brand = await getBrandBySlug(slug)

    if (!brand) {
        notFound()
    }

    // Fetch Brand Products (limit 50 for MVP to cover most cases without pagination UI yet)
    const { data: products } = await getProducts({
        brand: slug,
        limit: 50,
        sort: 'newest'
    })

    // Enhance products with nested category/brand if needed, 
    // but queries.ts getProducts usually returns basic info. 
    // We already have brand info from `brand` object.

    return <BrandClientView brand={brand} initialProducts={products} />
}
