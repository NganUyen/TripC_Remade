"use client"

import { useState, useMemo } from 'react'
import { BrandHeader } from '@/components/shop/brand-header'
import { BrandTabs } from '@/components/shop/brand-tabs'
import { ProductCard } from '@/components/shop/ProductCard'
import { Brand, Product } from '@/lib/shop/types'
import { formatPriceSimple } from '@/lib/hooks/useShopAPI'
import { LayoutGrid, AlertCircle } from 'lucide-react'

interface BrandClientViewProps {
    brand: Brand
    initialProducts: Product[]
}

export function BrandClientView({ brand, initialProducts }: BrandClientViewProps) {
    const [activeTab, setActiveTab] = useState('all')

    // Filter/Sort products based on active tab
    const displayedProducts = useMemo(() => {
        let sorted = [...initialProducts]

        switch (activeTab) {
            case 'top_selling':
                // Approximation using rating/reviews count since we don't have sales volume in public schema yet
                return sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
            case 'new_arrival':
                return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            case 'high_rating':
                return sorted.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
            case 'all':
            default:
                return sorted
        }
    }, [initialProducts, activeTab])

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Brand Header */}
                <BrandHeader brand={brand} />

                {/* Navigation Tabs */}
                <BrandTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Product Grid */}
                <div className="min-h-[400px]">
                    {displayedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {displayedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    slug={product.slug}
                                    title={product.title}
                                    price={formatPriceSimple(product.variants[0]?.price || 0)}
                                    // rating={product.rating_avg}
                                    // reviews={product.review_count}
                                    // Fix: handle possible simple number vs object mismatch if any, 
                                    // but types say number. 
                                    rating={Number(product.rating_avg) || 0}
                                    reviews={Number(product.review_count) || 0}
                                    image={product.images[0]?.url || "https://via.placeholder.com/400"}
                                    category={product.category?.name}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try selecting a different category.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
