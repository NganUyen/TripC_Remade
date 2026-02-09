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
import Image from 'next/image'

const ProfitChart = dynamic(() => import('./charts/ProfitChart').then(mod => mod.ProfitChart), { ssr: false })
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Overview of your store's performance
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex items-center shadow-sm">
                    {['today', '7d', '30d', '12m'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`
                                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${period === p
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse h-32" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Revenue"
                        value={stats ? formatCurrency(stats.revenue.amount) : '$0.00'}
                        change={stats?.revenue_change}
                        icon={DollarSign}
                        iconColor="text-emerald-600"
                        iconBg="bg-emerald-50"
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.orders ?? 0}
                        change={stats?.orders_change}
                        icon={ShoppingCart}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-50"
                    />
                    <StatCard
                        title="Product Views"
                        value={stats?.product_views ?? 0}
                        change={stats?.views_change}
                        icon={Eye}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-50"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={stats?.conversion_rate ?? 0}
                        icon={TrendingUp}
                        iconColor="text-amber-600"
                        iconBg="bg-amber-50"
                        suffix="%"
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left Column (8 cols) */}
                <div className="col-span-12 xl:col-span-8 space-y-6">

                    {/* Chart Section */}
                    {!isLoadingStats && dashboardStats?.chart && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <ProfitChart stats={dashboardStats.chart} />
                        </motion.div>
                    )}

                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Orders</h3>
                            <Link href="/shop/partner/orders" className="text-sm text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {ordersLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
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
                    </div>
                </div>

                {/* Right Column (4 cols) */}
                <div className="col-span-12 xl:col-span-4 space-y-6">

                    {/* Store Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                        {/* Cover */}
                        <div className="h-20 bg-slate-100 dark:bg-slate-800 relative">
                            {partner.cover_url ? (
                                <Image
                                    src={partner.cover_url}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
                            )}
                        </div>
                        <div className="px-6 pb-6">
                            <div className="-mt-10 mb-3 relative z-10 flex justify-between items-end">
                                <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border-[4px] border-white dark:border-slate-900 overflow-hidden shadow-sm">
                                    {partner.logo_url ? (
                                        <Image
                                            src={partner.logo_url}
                                            alt={partner.display_name || ''}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Store className="w-8 h-8 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className={`
                                    px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide
                                    ${partner.status === 'approved'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                                        : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20'
                                    }
                                `}>
                                    {partner.status === 'approved' ? 'Verified' : 'Pending'}
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">
                                {partner.display_name || partner.business_name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{partner.email}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Products</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{partner.product_count}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Rating</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                        {partner.rating_avg > 0 ? partner.rating_avg.toFixed(1) : '-'}
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/shop/partner/settings"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                            >
                                <Settings className="w-4 h-4" />
                                Edit Store Profile
                            </Link>
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    {products.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Products</h3>
                                <Link href="/shop/partner/products" className="text-xs text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {products.filter(p => p.status === 'active').slice(0, 5).map((product, idx) => (
                                    <TopProductRow key={product.id} product={product} rank={idx + 1} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function RecentOrderRow({ order }: { order: PartnerOrder }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        processing: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        shipped: 'bg-purple-50 text-purple-700 border-purple-100',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        cancelled: 'bg-slate-50 text-slate-600 border-slate-100',
    }

    return (
        <Link href={`/shop/partner/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 font-medium text-xs">
                #{order.order_number.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">#{order.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors[order.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
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
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </Link>
    )
}

function TopProductRow({ product, rank }: { product: PartnerProduct; rank: number }) {
    const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
    const lowestPrice = product.variants?.reduce((min, v) => v.price < min ? v.price : min, Infinity) ?? 0

    return (
        <Link href={`/shop/partner/products/${product.id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="w-6 text-center text-xs font-bold text-slate-400">
                {rank}
            </div>

            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                {primaryImage ? (
                    <img src={primaryImage.url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-400" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">{product.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500">{product.stock_total ?? 0} stock</p>
                </div>
            </div>

            <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {lowestPrice < Infinity ? `$${lowestPrice.toFixed(2)}` : '-'}
                </div>
            </div>
        </Link>
    )
}
