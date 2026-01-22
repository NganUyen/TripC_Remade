"use client"

import { ProductGallery } from "@/components/shop/product/ProductGallery"
import { ProductInfo } from "@/components/shop/product/ProductInfo"
import { ShopInfo } from "@/components/shop/product/ShopInfo"
import { ProductOverview } from "@/components/shop/product/ProductOverview"
import { PRODUCT_DATA } from "@/components/shop/product/productData"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/shop/ProductCard"
import { Header } from "@/components/Header"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"

import { useEffect } from "react"

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            {/* Breadcrumb Placeholder usually goes here */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Back Button */}
                <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Shop
                </Link>

                {/* Main Product Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Gallery (5 cols) */}
                        <div className="lg:col-span-5">
                            <ProductGallery images={PRODUCT_DATA.images} />
                        </div>

                        {/* Right: Info (7 cols) */}
                        <div className="lg:col-span-7">
                            <ProductInfo data={PRODUCT_DATA} />
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <ShopInfo />

                {/* Product Details & Reviews Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Details (9 cols) */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Details Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Product Description</h2>
                            <ProductOverview
                                description={PRODUCT_DATA.description}
                                aiInsight={PRODUCT_DATA.aiInsight}
                            />

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PRODUCT_DATA.inclusions.map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">Feature {i + 1}</span>
                                            <span className="text-slate-900 dark:text-white font-medium text-sm text-right">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Card (Placeholder reusing existing structure) */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ratings & Reviews</h2>
                            <div className="flex flex-col gap-6">
                                {PRODUCT_DATA.reviewsList.map((review, i) => (
                                    <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-slate-900 dark:text-white">{review.user}</span>
                                            <span className="text-xs text-slate-400">{review.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, starI) => (
                                                <Star key={starI} className={`w-4 h-4 ${starI < Math.floor(review.rating) ? 'fill-[#FF5E1F] text-[#FF5E1F]' : 'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800'} `} />
                                            ))}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Recommendation (3 cols) */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">From the same store</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-[320px]">
                                            <ProductCard
                                                id={i + 10}
                                                title="Monos Metro Duffel - Vegan Leather"
                                                price={180}
                                                rating={4.8}
                                                reviews={24}
                                                image={`https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop`}
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
