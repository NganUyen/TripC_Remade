"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePartnerProductStore } from '@/store/usePartnerProductStore'
import { EmptyState } from '../shared/EmptyState'
import { Package, Plus, Search, Eye, Edit, Trash2, Archive, Rocket, MoreVertical, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { PartnerProduct } from '@/lib/shop/types'

export function ProductList() {
    const router = useRouter()
    const {
        products,
        total,
        filters,
        page,
        limit,
        isLoading,
        isSaving,
        fetchProducts,
        setFilters,
        setPage,
        publishProduct,
        archiveProduct,
        deleteProduct,
    } = usePartnerProductStore()

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        draft: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
        archived: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
        flagged: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {total} product{total !== 1 ? 's' : ''} total
                    </p>
                </div>
                <Link
                    href="/shop/partner/products/new"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ status: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="flagged">Flagged</option>
                </select>
                <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ sort: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                </select>
            </div>

            {/* Product List */}
            {isLoading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="hidden sm:block space-y-2 text-right">
                                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No products found"
                    description={filters.search || filters.status !== 'all'
                        ? "No products match your current filters."
                        : "Start by adding your first product to the store."
                    }
                    action={!filters.search && filters.status === 'all' ? {
                        label: 'Add Product',
                        onClick: () => router.push('/shop/partner/products/new'),
                    } : undefined}
                />
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {products.map((product, idx) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                index={idx}
                                statusColors={statusColors}
                                isSaving={isSaving}
                                onPublish={() => publishProduct(product.id)}
                                onArchive={() => archiveProduct(product.id)}
                                onDelete={() => {
                                    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
                                        deleteProduct(product.id)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

function ProductRow({
    product,
    index,
    statusColors,
    isSaving,
    onPublish,
    onArchive,
    onDelete,
}: {
    product: PartnerProduct
    index: number
    statusColors: Record<string, string>
    isSaving: boolean
    onPublish: () => void
    onArchive: () => void
    onDelete: () => void
}) {
    const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
    const lowestPrice = product.variants?.reduce((min, v) => v.price < min ? v.price : min, Infinity) ?? 0
    const [showActions, setShowActions] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative first:rounded-t-2xl last:rounded-b-2xl ${showActions ? 'z-30' : 'z-0'}`}
        >
            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {primaryImage ? (
                    <img src={primaryImage.url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/shop/partner/products/${product.id}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors truncate"
                    >
                        {product.title}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[product.status] || ''}`}>
                        {product.status}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                    {product.variants?.length || 0} variants · Stock: {product.stock_total ?? 0}
                    {product.category && ` · ${product.category.name}`}
                </p>
            </div>

            {/* Price */}
            <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {lowestPrice < Infinity ? `$${lowestPrice.toFixed(2)}` : 'No price'}
                </div>
                <div className="text-xs text-slate-500">
                    {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Actions */}
            <div className="relative">
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>

                {showActions && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-20 py-1">
                            <Link
                                href={`/shop/partner/products/${product.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </Link>
                            {product.status === 'active' && (
                                <Link
                                    href={`/shop/product/${product.id}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <Eye className="w-4 h-4" /> View in Shop
                                </Link>
                            )}
                            {(product.status === 'draft' || product.status === 'archived') && (
                                <button
                                    onClick={() => { onPublish(); setShowActions(false) }}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 w-full"
                                >
                                    <Rocket className="w-4 h-4" /> Publish
                                </button>
                            )}
                            {product.status === 'active' && (
                                <button
                                    onClick={() => { onArchive(); setShowActions(false) }}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 w-full"
                                >
                                    <Archive className="w-4 h-4" /> Archive
                                </button>
                            )}
                            <button
                                onClick={() => { onDelete(); setShowActions(false) }}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    )
}
