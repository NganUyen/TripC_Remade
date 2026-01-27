"use client"

import { ProductGallery } from "@/components/shop/product/ProductGallery"
import { ProductInfo } from "@/components/shop/product/ProductInfo"
import { ShopInfo } from "@/components/shop/product/ShopInfo"
import { ProductOverview } from "@/components/shop/product/ProductOverview"
import { ProductReviews } from "@/components/shop/product/ProductReviews"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/shop/ProductCard"
import Link from "next/link"
import { ArrowLeft, Star, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useProduct, useProducts, formatPriceSimple } from "@/lib/hooks/useShopAPI"

export default function ProductDetailsPage() {
    // Use useParams hook instead of use(params) for client components
    const params = useParams<{ id: string }>();
    const slug = params.id;

    const { product, loading, error } = useProduct(slug);
    const { products: relatedProducts } = useProducts({ limit: 3 });

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF5E1F]" />
                    <p className="text-slate-500">Loading product...</p>
                </div>
            </main>
        )
    }

    // Error state
    if (error || !product) {
        return (
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h1>
                    <p className="text-slate-500">The product you're looking for doesn't exist.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[#FF5E1F] font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shop
                    </Link>
                </div>
            </main>
        )
    }

    // Transform API data for components
    const productData = {
        id: product.id,
        category: product.category?.name || "Travel Gear",
        brandName: product.brand?.name || "TripC Store",
        title: product.title,
        sku: product.variants[0]?.sku || "N/A",
        rating: String(product.rating_avg),
        reviews: String(product.review_count),
        price: String(formatPriceSimple(product.variants[0]?.price.amount || 0)),
        oldPrice: product.variants[0]?.compare_at_price
            ? String(formatPriceSimple(product.variants[0].compare_at_price.amount))
            : undefined,
        stock: product.variants[0]?.stock_on_hand || 0,
        description: product.description,
        images: product.images.map(img => img.url),
        highlights: [],
        inclusions: product.variants[0]?.options.map(opt => ({
            label: opt.name,
            value: opt.value
        })) || [],
        aiInsight: {
            match: "Perfect Match",
            reason: `Great ${product.category?.name || 'product'} for your travel needs.`,
            bestTime: product.is_featured ? "Featured Product" : "Popular Choice",
            tip: "Check out the variants for more options."
        },
        variants: [
            {
                id: "v1",
                type: "Options",
                options: product.variants.map(v => ({
                    id: v.id,
                    name: v.title,
                    price: formatPriceSimple(v.price.amount),
                    stock: v.stock_on_hand
                }))
            }
        ],
    };

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Back Button */}
                <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Shop
                </Link>

                {/* Main Product Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Gallery */}
                        <div className="lg:col-span-5">
                            <ProductGallery images={productData.images} />
                        </div>

                        {/* Right: Info */}
                        <div className="lg:col-span-7">
                            <ProductInfo
                                data={productData}
                            // No pre-selection to force user choice
                            // variantId={product.variants[0]?.id}
                            />
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <ShopInfo brand={product.brand} />

                {/* Product Details & Reviews Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Details */}
                    <div className="lg:col-span-9 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Product Description</h2>
                            <ProductOverview
                                description={productData.description}
                                aiInsight={productData.aiInsight}
                            />

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {productData.inclusions.map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">{item.label}</span>
                                            <span className="text-slate-900 dark:text-white font-medium text-sm text-right">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <ProductReviews slug={product.slug} />
                        </div>
                    </div>

                    {/* Right: Sidebar Recommendations */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">You might also like</h3>
                                <div className="space-y-6">
                                    {relatedProducts.slice(0, 3).map((p) => (
                                        <div key={p.id} className="h-[320px]">
                                            <ProductCard
                                                id={p.id}
                                                slug={p.slug}
                                                title={p.title}
                                                price={formatPriceSimple(p.price_from.amount)}
                                                rating={p.rating_avg}
                                                reviews={p.review_count}
                                                image={p.image_url || "https://via.placeholder.com/400"}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
