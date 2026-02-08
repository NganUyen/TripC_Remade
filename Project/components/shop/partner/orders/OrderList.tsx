"use client"

import { useEffect, useState } from 'react'
import { usePartnerOrderStore } from '@/store/usePartnerOrderStore'
import { EmptyState } from '../shared/EmptyState'
import {
    ShoppingCart,
    Search,
    Loader2,
    ArrowRight,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    XCircle,
    CalendarDays,
    Filter,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { PartnerOrder } from '@/lib/shop/types'

const ORDER_STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    pending: { color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Clock },
    confirmed: { color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: CheckCircle2 },
    processing: { color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', icon: Package },
    shipped: { color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: Truck },
    delivered: { color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
}

export function OrderList() {
    const {
        orders,
        total,
        filters,
        page,
        limit,
        isLoading,
        fetchOrders,
        setFilters,
        setPage,
    } = usePartnerOrderStore()

    const [showDateFilters, setShowDateFilters] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {total} order{total !== 1 ? 's' : ''} total
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ status: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowDateFilters(!showDateFilters)}
                        className={`
                            inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
                            ${showDateFilters || filters.from || filters.to
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }
                        `}
                    >
                        <CalendarDays className="w-4 h-4" />
                        Date Range
                        {(filters.from || filters.to) && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                    </button>
                </div>

                {/* Date Range Filters */}
                {showDateFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From</label>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) => setFilters({ from: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To</label>
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) => setFilters({ to: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        {(filters.from || filters.to) && (
                            <button
                                onClick={() => setFilters({ from: '', to: '' })}
                                className="self-end px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Order List */}
            {isLoading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="hidden sm:block space-y-2 text-right">
                                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                            </div>
                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState
                    icon={ShoppingCart}
                    title="No orders found"
                    description={filters.status || filters.from || filters.to
                        ? "No orders match your current filters."
                        : "Orders will appear here once customers purchase your products."
                    }
                />
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orders.map((order, idx) => (
                            <OrderRow key={order.id} order={order} index={idx} />
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

function OrderRow({ order, index }: { order: PartnerOrder; index: number }) {
    const config = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
        >
            <Link
                href={`/shop/partner/orders/${order.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <StatusIcon className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            #{order.order_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.customer_name} · {order.item_count} item{order.item_count > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Amount & Date */}
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ${order.partner_subtotal.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </Link>
        </motion.div>
    )
}
