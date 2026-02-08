"use client"

import { useEffect, useState } from 'react'
import { usePartnerStore } from '@/store/usePartnerStore'
import { usePartnerProductStore } from '@/store/usePartnerProductStore'
import { usePartnerOrderStore } from '@/store/usePartnerOrderStore'
import { StatCard } from '../shared/StatCard'
import { EmptyState } from '../shared/EmptyState'
import {
    DollarSign,
    ShoppingCart,
    Eye,
    TrendingUp,
    Package,
    ArrowRight,
    Star,
    Store,
    Globe,
    Mail,
    Loader2,
    Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { PartnerOrder, PartnerProduct } from '@/lib/shop/types'
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('./charts/RevenueChart').then(mod => mod.RevenueChart), { ssr: false })
const ProductStatusChart = dynamic(() => import('./charts/ProductStatusChart').then(mod => mod.ProductStatusChart), { ssr: false })
const OrderStatusChart = dynamic(() => import('./charts/OrderStatusChart').then(mod => mod.OrderStatusChart), { ssr: false })

export function DashboardView() {
    const { partner, dashboardStats, fetchDashboardStats } = usePartnerStore()
    const { products, total: productTotal, fetchProducts, isLoading: productsLoading } = usePartnerProductStore()
    const { orders, total: orderTotal, fetchOrders, isLoading: ordersLoading } = usePartnerOrderStore()
    const [period, setPeriod] = useState('7d')
    const [isLoadingStats, setIsLoadingStats] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingStats(true)
            await Promise.all([
                fetchDashboardStats(period),
                fetchProducts({ page: 1 }),
                fetchOrders({ page: 1 }),
            ])
            setIsLoadingStats(false)
        }
        loadData()
    }, [period, fetchDashboardStats, fetchProducts, fetchOrders])

    if (!partner) return null

    const stats = dashboardStats?.stats
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
    }

    // Product status counts
    const activeProducts = products.filter(p => p.status === 'active').length
    const draftProducts = products.filter(p => p.status === 'draft').length
    const archivedProducts = products.filter(p => p.status === 'archived').length

    // Order status counts
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const processingOrders = orders.filter(o => o.status === 'processing').length
    const shippedOrders = orders.filter(o => o.status === 'shipped').length

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Welcome back, <span className="font-semibold text-slate-900 dark:text-white">{partner.display_name || partner.business_name}</span>
                    </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                    {['today', '7d', '30d', '12m'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }
                            `}
                        >
                            {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse h-32" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Revenue"
                        value={stats ? formatCurrency(stats.revenue.amount) : '$0.00'}
                        change={stats?.revenue_change}
                        icon={DollarSign}
                        iconColor="text-emerald-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
                    />
                    <StatCard
                        title="Orders"
                        value={stats?.orders ?? 0}
                        change={stats?.orders_change}
                        icon={ShoppingCart}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-50 dark:bg-blue-500/10"
                    />
                    <StatCard
                        title="Product Views"
                        value={stats?.product_views ?? 0}
                        change={stats?.views_change}
                        icon={Eye}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-50 dark:bg-purple-500/10"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={stats?.conversion_rate ?? 0}
                        icon={TrendingUp}
                        iconColor="text-primary"
                        iconBg="bg-primary/10"
                        suffix="%"
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left Column: Charts & Tables (8 cols) */}
                <div className="col-span-12 xl:col-span-8 space-y-6">

                    {/* Revenue Chart */}
                    {!isLoadingStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <RevenueChart stats={dashboardStats?.chart} />
                        </motion.div>
                    )}

                    {/* Recent Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Orders</h3>
                            <Link href="/shop/partner/orders" className="text-sm text-primary font-medium hover:text-primary-hover flex items-center gap-1 transition-colors">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {ordersLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={ShoppingCart}
                                    title="No orders yet"
                                    description="Orders will appear here once customers purchase your products."
                                />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {orders.slice(0, 5).map((order) => (
                                    <RecentOrderRow key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Top Products */}
                    {products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Top Products</h3>
                                <Link href="/shop/partner/products" className="text-sm text-primary font-medium hover:text-primary-hover flex items-center gap-1 transition-colors">
                                    Manage <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {products.filter(p => p.status === 'active').slice(0, 5).map((product, idx) => (
                                    <TopProductRow key={product.id} product={product} rank={idx + 1} />
                                ))}
                                {products.filter(p => p.status === 'active').length === 0 && (
                                    <div className="p-12">
                                        <EmptyState
                                            icon={Package}
                                            title="No active products"
                                            description="Publish your draft products to start selling."
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Profile & Status (4 cols) */}
                <div className="col-span-12 xl:col-span-4 space-y-6">

                    {/* Store Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Cover */}
                        <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                            {partner.cover_url && (
                                <img src={partner.cover_url} alt="" className="w-full h-full object-cover opacity-90" />
                            )}
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <div className="px-6 pb-6">
                            <div className="-mt-10 mb-4 relative z-10 flex justify-between items-end">
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-[3px] border-white dark:border-slate-900 overflow-hidden shadow-md">
                                    {partner.logo_url ? (
                                        <img src={partner.logo_url} alt={partner.display_name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Store className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className={`
                                    px-3 py-1 rounded-full text-xs font-bold border
                                    ${partner.status === 'approved'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                                        : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20'
                                    }
                                `}>
                                    {partner.status === 'approved' ? 'Verified Partner' : 'Pending Approval'}
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white text-xl">
                                {partner.display_name || partner.business_name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {partner.description || "No description provided."}
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="truncate flex-1">{partner.email}</span>
                                </div>
                                {partner.website && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="truncate flex-1 hover:text-primary transition-colors">
                                            {partner.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
                                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">{partner.product_count}</div>
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Products</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">{partner.order_count}</div>
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Orders</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                        {partner.rating_avg > 0 ? partner.rating_avg.toFixed(1) : '-'}
                                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                                    </div>
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Rating</div>
                                </div>
                            </div>

                            <Link
                                href="/shop/partner/settings"
                                className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                            >
                                <Settings className="w-4 h-4" />
                                Edit Store Profile
                            </Link>
                        </div>
                    </motion.div>

                    {/* Status Charts */}
                    <div className="grid grid-cols-1 gap-6">
                        {products.length > 0 && (
                            <div className="h-[300px]">
                                <ProductStatusChart products={products} />
                            </div>
                        )}
                        {orders.length > 0 && (
                            <div className="h-[300px]">
                                <OrderStatusChart orders={orders} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function RecentOrderRow({ order }: { order: PartnerOrder }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        confirmed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
        processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
        shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
        delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    }

    return (
        <Link href={`/shop/partner/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 font-medium text-xs">
                #{order.order_number.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">#{order.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status}
                    </span>
                </div>
                <p className="text-xs text-slate-500">{order.customer_name} • {order.item_count} items</p>
            </div>
            <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                    ${order.partner_subtotal.amount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-slate-100 group-hover:text-primary transition-all">
                <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    )
}

function TopProductRow({ product, rank }: { product: PartnerProduct; rank: number }) {
    const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
    const lowestPrice = product.variants?.reduce((min, v) => v.price < min ? v.price : min, Infinity) ?? 0

    return (
        <Link href={`/shop/partner/products/${product.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    rank === 2 ? 'bg-slate-200 text-slate-700' :
                        rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}
            `}>
                {rank}
            </div>

            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                {primaryImage ? (
                    <img src={primaryImage.url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{product.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500">{product.variants?.length || 0} vars</p>
                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                    <p className="text-xs text-slate-500">{product.stock_total ?? 0} in stock</p>
                </div>
            </div>

            <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {lowestPrice < Infinity ? `$${lowestPrice.toFixed(2)}` : 'N/A'}
                </div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{product.rating_avg > 0 ? product.rating_avg.toFixed(1) : '-'}</span>
                </div>
            </div>
        </Link>
    )
}
