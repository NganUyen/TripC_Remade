"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { ProductCard } from '@/components/shop/ProductCard'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid, Search } from 'lucide-react'
import Link from 'next/link'
import { useCategories, formatPriceSimple } from '@/lib/hooks/useShopAPI'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL Params
    const query = searchParams.get('q') || ''
    const categoryParam = searchParams.get('category') || ''
    const minPriceParam = searchParams.get('min_price') || ''
    const maxPriceParam = searchParams.get('max_price') || ''
    const sortParam = searchParams.get('sort') || 'relevance'

    // Local state
    const [priceRange, setPriceRange] = useState({ min: minPriceParam, max: maxPriceParam })
    const [priceSlider, setPriceSlider] = useState(500)
    const { categories } = useCategories()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [gridCols, setGridCols] = useState<2 | 3 | 4>(3)

    // Fetch Results
    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (query) params.set('q', query)
                if (categoryParam) params.set('category', categoryParam)
                if (minPriceParam) params.set('min_price', minPriceParam)
                if (maxPriceParam) params.set('max_price', maxPriceParam)
                if (sortParam) params.set('sort', sortParam)

                const res = await fetch(`/api/shop/products/search?${params.toString()}`)
                const data = await res.json()

                if (data.success) {
                    setProducts(data.data)
                    setTotal(data.pagination?.total || 0)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query, categoryParam, minPriceParam, maxPriceParam, sortParam])

    // Update URL helper
    const updateFilters = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null) params.delete(key)
            else params.set(key, value)
        })
        router.push(`/shop/search?${params.toString()}`)
    }

    const clearAllFilters = () => {
        router.push('/shop/search' + (query ? `?q=${query}` : ''))
    }

    const handleSortChange = (value: string) => {
        updateFilters({ sort: value })
    }

    const applyPriceFilter = () => {
        updateFilters({
            min_price: priceRange.min || null,
            max_price: priceSlider < 500 ? String(priceSlider) : null
        })
    }

    const hasActiveFilters = categoryParam || minPriceParam || maxPriceParam

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* Top Bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-40">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
                    <Link href="/shop" className="font-bold text-lg hover:text-[#FF5E1F] transition-colors">
                        ← Back to Shop
                    </Link>

                    {/* Mobile Filter Toggle */}
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

                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800 sticky top-20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5" /> Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-[#FF5E1F] font-bold hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Category Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Category</h4>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => updateFilters({ category: null })}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${!categoryParam
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateFilters({ category: cat.slug })}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${categoryParam === cat.slug
                                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</h4>
                                        <span className="text-[#FF5E1F] font-bold text-sm">${priceSlider}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        value={priceSlider}
                                        onChange={(e) => setPriceSlider(Number(e.target.value))}
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
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">

                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-black">
                                    {query ? `"${query}"` : categoryParam ? categories.find(c => c.slug === categoryParam)?.name || 'Products' : 'All Products'}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">{total} results found</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Grid Toggle */}
                                <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setGridCols(2)}
                                        className={`p-2 rounded ${gridCols === 2 ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setGridCols(3)}
                                        className={`p-2 rounded ${gridCols === 3 ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={sortParam}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 pr-10 text-sm font-bold appearance-none cursor-pointer"
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

                        {/* Active Filters Pills */}
                        {hasActiveFilters && (
                            <div className="flex gap-2 flex-wrap mb-6">
                                {categoryParam && (
                                    <button
                                        onClick={() => updateFilters({ category: null })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium"
                                    >
                                        {categories.find(c => c.slug === categoryParam)?.name}
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {(minPriceParam || maxPriceParam) && (
                                    <button
                                        onClick={() => updateFilters({ min_price: null, max_price: null })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium"
                                    >
                                        ${minPriceParam || '0'} - ${maxPriceParam || '∞'}
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        {loading ? (
                            <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-slate-200 dark:bg-zinc-800 rounded-2xl aspect-square mb-3" />
                                        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded mb-2" />
                                        <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        slug={product.slug}
                                        title={product.title}
                                        price={formatPriceSimple(product.price_from?.amount || 0)}
                                        rating={product.rating_avg}
                                        reviews={product.review_count || 0}
                                        image={product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'}
                                        badge={product.is_featured ? 'Featured' : undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No matches found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm text-center px-4">
                                    We couldn't find any products matching your search for "{query}". Try checking for typos or using broader terms.
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

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-zinc-900 z-50 lg:hidden overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Filters</h3>
                                    <button onClick={() => setShowMobileFilters(false)}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Same filter content as desktop */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Category</h4>
                                        <div className="space-y-1">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        updateFilters({ category: cat.slug })
                                                        setShowMobileFilters(false)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${categoryParam === cat.slug
                                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Price Range</h4>
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            value={priceSlider}
                                            onChange={(e) => setPriceSlider(Number(e.target.value))}
                                            className="w-full accent-[#FF5E1F]"
                                        />
                                        <div className="flex justify-between text-sm mt-2">
                                            <span>$0</span>
                                            <span className="font-bold text-[#FF5E1F]">${priceSlider}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => {
                                            clearAllFilters()
                                            setShowMobileFilters(false)
                                        }}
                                        className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => {
                                            applyPriceFilter()
                                            setShowMobileFilters(false)
                                        }}
                                        className="flex-1 py-3 bg-[#FF5E1F] text-white rounded-xl font-bold"
                                    >
                                        Apply
                                    </button>
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
