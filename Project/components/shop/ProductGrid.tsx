"use client"

import React, { useState } from 'react'
import { ProductCard } from './ProductCard'
import { useProducts, formatPriceSimple } from '@/lib/hooks/useShopAPI'
import { Loader2 } from 'lucide-react'

export function ProductGrid() {
    const [sort, setSort] = useState<string>('newest');
    const [limit, setLimit] = useState(8);
    const { products, total, loading, error } = useProducts({ limit, sort });

    const hasMore = products.length < total;

    const handleLoadMore = () => {
        setLimit(prev => prev + 8);
    };

    // Loading skeleton
    if (loading && products.length === 0) {
        return (
            <section className="pb-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Trending Gear</h3>
                    <div className="flex gap-2">
                        <button className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-bold">Recommended</button>
                        <button className="px-4 py-2 rounded-full text-sm font-bold text-slate-500">Newest</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-slate-200 dark:bg-zinc-800 rounded-3xl aspect-square mb-4" />
                            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
                            <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="pb-12">
                <div className="text-center py-12 text-slate-500">
                    <p>Failed to load products. Please try again.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="pb-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Trending Gear</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSort('rating')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${sort === 'rating'
                            ? 'bg-slate-100 dark:bg-zinc-800'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-900'
                            }`}
                    >
                        Recommended
                    </button>
                    <button
                        onClick={() => setSort('newest')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${sort === 'newest'
                            ? 'bg-slate-100 dark:bg-zinc-800'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-900'
                            }`}
                    >
                        Newest
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        slug={product.slug}
                        title={product.title}
                        price={formatPriceSimple(product.price_from.amount)}
                        rating={product.rating_avg}
                        reviews={product.review_count}
                        image={product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'}
                        badge={product.is_featured ? 'Featured' : undefined}
                    />
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>No products found.</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="mt-16 flex flex-col items-center gap-2">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            `Load More Products (${products.length}/${total})`
                        )}
                    </button>
                    <span className="text-xs text-slate-400">Showing {products.length} of {total} products</span>
                </div>
            )}
        </section>
    )
}
