"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePartnerOrderStore } from '@/store/usePartnerOrderStore'
import {
    ArrowLeft,
    Loader2,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    MapPin,
    User,
    Calendar,
    Hash,
    DollarSign,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { PartnerOrderItem } from '@/lib/shop/types'
import Image from 'next/image'

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
    confirmed: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: CheckCircle2 },
    processing: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Package },
    shipped: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: Truck },
    delivered: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
    cancelled: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: XCircle },
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
}

interface OrderDetailProps {
    orderId: string
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const router = useRouter()
    const { currentOrder, isLoadingOrder, isUpdating, error, fetchOrder, clearCurrentOrder, updateOrderStatus } = usePartnerOrderStore()

    useEffect(() => {
        fetchOrder(orderId)
        return () => clearCurrentOrder()
    }, [orderId, fetchOrder, clearCurrentOrder])

    if (isLoadingOrder) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading order...</p>
                </div>
            </div>
        )
    }

    if (error || !currentOrder) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto p-8"
                >
                    <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        {error || "The order you're looking for doesn't exist or you don't have access to it."}
                    </p>
                    <Link
                        href="/shop/partner/orders"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </motion.div>
            </div>
        )
    }

    const order = currentOrder
    const config = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = config.icon
    const availableTransitions = STATUS_TRANSITIONS[order.status] || []

    const handleStatusUpdate = async (newStatus: string) => {
        const success = await updateOrderStatus(order.id, newStatus)
        if (success && newStatus === 'cancelled') {
            // Stay on page, order will update
        }
    }

    const address = order.shipping_address as Record<string, string> | undefined

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/shop/partner/orders"
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Order #{order.order_number}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status + Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                                    <p className={`text-sm font-bold capitalize ${config.color}`}>
                                        {order.status}
                                    </p>
                                </div>
                            </div>

                            {availableTransitions.length > 0 && (
                                <div className="flex items-center gap-2">
                                    {availableTransitions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(status)}
                                            disabled={isUpdating}
                                            className={`
                                                px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50
                                                ${status === 'cancelled'
                                                    ? 'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                                    : 'bg-primary text-white hover:bg-primary-hover'
                                                }
                                            `}
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Order Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Items ({order.item_count})
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {order.items.map((item) => (
                                <OrderItemRow key={item.id} item={item} />
                            ))}
                        </div>
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Partner Subtotal
                                </span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    ${order.partner_subtotal.amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                    >
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Customer
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <User className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                <span>{order.customer_name}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping Address */}
                    {address && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Shipping Address
                            </h3>
                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                {address.recipient_name && (
                                    <p className="font-medium text-slate-900 dark:text-white">{address.recipient_name}</p>
                                )}
                                {address.phone && <p>{address.phone}</p>}
                                {address.address_line1 && <p>{address.address_line1}</p>}
                                {address.address_line2 && <p>{address.address_line2}</p>}
                                <p>
                                    {[address.city, address.state_province, address.postal_code]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                {address.country_code && <p>{address.country_code}</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
                    >
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Items</span>
                                <span className="font-medium text-slate-900 dark:text-white">{order.item_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Order ID</span>
                                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{order.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Created</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {new Date(order.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Your Subtotal</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    ${order.partner_subtotal.amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function OrderItemRow({ item }: { item: PartnerOrderItem }) {
    return (
        <div className="flex items-center gap-4 p-4">
            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.product_title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.product_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.variant_title} · Qty: {item.qty}
                </p>
            </div>

            {/* Price */}
            <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                    ${item.line_total.amount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                    ${item.unit_price.amount.toFixed(2)} each
                </div>
            </div>
        </div>
    )
}
