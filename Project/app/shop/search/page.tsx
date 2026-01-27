"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { ProductCard } from '@/components/shop/ProductCard'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid, Search, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCategories, useBrands, formatPriceSimple, shopApi } from '@/lib/hooks/useShopAPI'
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from "@/components/ui/checkbox"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL Params (Source of Truth)
    const query = searchParams.get('q') || ''
    const categoryParam = searchParams.get('category') || ''
    const brandParam = searchParams.get('brand') || ''
    const minPriceParam = searchParams.get('min_price') || ''
    const maxPriceParam = searchParams.get('max_price') || ''
    const minRatingParam = searchParams.get('min_rating') || ''
    const sortParam = searchParams.get('sort') || 'relevance'

    // Hooks
    const { categories } = useCategories()
    const { brands } = useBrands()

    // Local State
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [total, setTotal] = useState(0)
    const [offset, setOffset] = useState(0)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [gridCols, setGridCols] = useState<2 | 3 | 4>(3)

    // Price Slider State (Local until applied)
    const [priceRange, setPriceRange] = useState(500)

    const LIMIT = 20

    // Fetch Logic
    const fetchResults = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) setLoading(true)
        else setLoadingMore(true)

        try {
            const currentOffset = isLoadMore ? offset : 0

            const { data, total, error } = await shopApi.getProducts({
                q: query,
                category: categoryParam,
                brand: brandParam,
                minPrice: minPriceParam ? Number(minPriceParam) : undefined,
                maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
                minRating: minRatingParam ? Number(minRatingParam) : undefined,
                sort: sortParam,
                limit: LIMIT,
                offset: currentOffset
            })

            if (!error) {
                if (isLoadMore) {
                    setProducts(prev => [...prev, ...data])
                } else {
                    setProducts(data)
                }
                setTotal(total)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [query, categoryParam, brandParam, minPriceParam, maxPriceParam, minRatingParam, sortParam, offset])

    // Initial Fetch & Filter Change
    useEffect(() => {
        setOffset(0)
        fetchResults(false)
        // Sync price slider with URL if needed
        if (maxPriceParam) setPriceRange(Number(maxPriceParam))
    }, [query, categoryParam, brandParam, minPriceParam, maxPriceParam, minRatingParam, sortParam])

    // Load More Effect
    useEffect(() => {
        if (offset > 0) {
            fetchResults(true)
        }
    }, [offset])

    const handleLoadMore = () => {
        setOffset(prev => prev + LIMIT)
    }

    // Filters Helper
    const updateFilters = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null) params.delete(key)
            else params.set(key, value)
        })
        router.push(`/shop/search?${params.toString()}`)
    }

    const clearAllFilters = () => {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        router.push(`/shop/search?${params.toString()}`)
    }

    const applyPriceFilter = () => {
        updateFilters({
            min_price: '0',
            max_price: priceRange < 500 ? String(priceRange) : null
        })
    }

    const hasActiveFilters = categoryParam || brandParam || minPriceParam || maxPriceParam || minRatingParam

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* Top Bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-40">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
                    <Link href="/shop" className="font-bold text-lg hover:text-[#FF5E1F] transition-colors">
                        ← Back to Shop
                    </Link>

                    <button
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-bold"
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-[#FF5E1F] rounded-full" />}
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
                <div className="flex gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5" /> Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button onClick={clearAllFilters} className="text-sm text-[#FF5E1F] font-bold hover:underline">
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8">
                                {/* Categories */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Category</h4>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => updateFilters({ category: null })}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${!categoryParam ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateFilters({ category: cat.slug })}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${categoryParam === cat.slug ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Brands */}
                                {brands.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Brands</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {brands.map(brand => (
                                                <div key={brand.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`brand-${brand.id}`}
                                                        checked={brandParam === brand.slug}
                                                        onCheckedChange={(checked) => updateFilters({ brand: checked ? brand.slug : null })}
                                                    />
                                                    <label
                                                        htmlFor={`brand-${brand.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {brand.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Range */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price</h4>
                                        <span className="text-[#FF5E1F] font-bold text-sm">${priceRange}{priceRange >= 500 ? '+' : ''}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="500" step="10"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#FF5E1F]"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                        <span>$0</span>
                                        <span>$500+</span>
                                    </div>
                                    <button
                                        onClick={applyPriceFilter}
                                        className="w-full mt-4 py-2 bg-[#FF5E1F] text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        Apply Price
                                    </button>
                                </div>

                                {/* Rating */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Minimum Rating</h4>
                                    <div className="space-y-2">
                                        {[4, 3, 2, 1].map(stars => (
                                            <button
                                                key={stars}
                                                onClick={() => updateFilters({ min_rating: String(stars) })}
                                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${Number(minRatingParam) === stars ? 'bg-orange-50 dark:bg-orange-900/20 text-[#FF5E1F]' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                                            >
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-[#FF5E1F] text-[#FF5E1F]' : 'text-slate-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium">& Up</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-black">
                                    {query ? `"${query}"` : categoryParam ? categories.find(c => c.slug === categoryParam)?.name : 'All Results'}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    {loading ? 'Searching...' : `${total} results found`}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort */}
                                <div className="relative">
                                    <select
                                        value={sortParam}
                                        onChange={(e) => updateFilters({ sort: e.target.value })}
                                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 pr-10 text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5E1F]"
                                    >
                                        <option value="relevance">Best Match</option>
                                        <option value="newest">Newest</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Bar */}
                        {hasActiveFilters && (
                            <div className="flex gap-2 flex-wrap mb-6">
                                {categoryParam && (
                                    <button onClick={() => updateFilters({ category: null })} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-slate-200">
                                        {categories.find(c => c.slug === categoryParam)?.name || categoryParam} <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {brandParam && (
                                    <button onClick={() => updateFilters({ brand: null })} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-slate-200">
                                        Brand: {brands.find(b => b.slug === brandParam)?.name || brandParam} <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {(minPriceParam || maxPriceParam) && (
                                    <button onClick={() => updateFilters({ min_price: null, max_price: null })} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-slate-200">
                                        ${minPriceParam || 0} - ${maxPriceParam || 'Max'} <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {minRatingParam && (
                                    <button onClick={() => updateFilters({ min_rating: null })} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-slate-200">
                                        {minRatingParam}+ Stars <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button onClick={clearAllFilters} className="text-sm text-[#FF5E1F] font-bold hover:underline px-2">
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-slate-200 dark:bg-zinc-800 rounded-2xl aspect-square mb-3" />
                                        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded mb-2 w-3/4" />
                                        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            id={product.id}
                                            slug={product.slug}
                                            title={product.title}
                                            price={formatPriceSimple(product.price_from?.amount || product.price)}
                                            rating={product.rating_avg}
                                            reviews={product.review_count || 0}
                                            image={product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'}
                                            badge={product.is_featured ? 'Featured' : undefined}
                                        />
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {products.length < total && (
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="px-8 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loadingMore ? (
                                                <>Loading...</>
                                            ) : (
                                                <>Load More Results ({total - products.length} remaining)</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No matches found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm text-center px-4">
                                    We couldn't find any products matching your filters. Try adjusting your search or filters.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-8 py-3 bg-[#FF5E1F] text-white rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer (Simplified for brevity, same logic as Sidebar) */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-zinc-900 z-50 lg:hidden overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Filters</h3>
                                    <button onClick={() => setShowMobileFilters(false)}><X className="w-6 h-6" /></button>
                                </div>
                                {/* Mobile filter content would go here - duplicating sidebar logic */}
                                <div className="space-y-6">
                                    <button onClick={clearAllFilters} className="w-full py-3 border rounded-xl font-bold">Reset All</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <Footer />
        </main>
    )
}
