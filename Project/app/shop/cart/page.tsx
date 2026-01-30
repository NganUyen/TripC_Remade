"use client"

import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/hooks/useShopAPI'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'

export default function CartPage() {
    const { cart, isLoading, pendingItemIds, updateItem, removeItem, initCart, applyVoucher } = useCartStore()
    const { userId, isLoaded } = useAuth()
    const router = useRouter()
    const [couponInput, setCouponInput] = useState('')

    const handleApplyCoupon = () => {
        if (!couponInput) return
        applyVoucher(couponInput)
    }

    // Fetch cart data on mount
    useEffect(() => {
        if (isLoaded && userId) {
            initCart()
        }
    }, [isLoaded, userId, initCart])

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push('/sign-in')
        }
    }, [isLoaded, userId, router])

    // No await needed - optimistic update happens immediately
    const handleUpdateQty = (itemId: string, newQty: number) => {
        if (newQty < 1) return
        updateItem(itemId, newQty)
    }

    const handleRemove = (itemId: string) => {
        removeItem(itemId)
    }

    // Loading state
    if (isLoading || !isLoaded) {
        return (
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-32 animate-pulse" />
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-80 animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    // Empty cart
    if (!cart || cart.items.length === 0) {
        return (
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium mb-8">
                        <ArrowLeft className="w-5 h-5" />
                        Continue Shopping
                    </Link>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h1>
                        <p className="text-slate-500 mb-6">Start shopping and add items to your cart.</p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-[#FF5E1F] text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium mb-2">
                            <ArrowLeft className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
                    </div>
                    <span className="text-slate-500">{cart.item_count} item{cart.item_count !== 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => {
                            const isPending = pendingItemIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-opacity ${isPending ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title_snapshot} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ShoppingBag className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">
                                                {item.title_snapshot}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-2">
                                                {Object.entries(item.variant_snapshot).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                            </p>
                                            <p className="text-[#FF5E1F] font-bold">
                                                {formatPrice(item.unit_price)}
                                            </p>
                                        </div>

                                        {/* Quantity & Actions */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                                                <button
                                                    onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                                                    disabled={isPending || item.qty <= 1}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-bold text-slate-900 dark:text-white">{item.qty}</span>
                                                <button
                                                    onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                                                    disabled={isPending}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={isPending}
                                                className="text-red-500 hover:text-red-600 p-2 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {formatPrice(item.line_total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
                                </div>

                                {cart.discount_total.amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Discount</span>
                                        <span className="font-medium text-green-600">-{formatPrice(cart.discount_total)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-slate-400 text-xs">Calculated at checkout</span>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                        <span className="text-2xl font-bold text-[#FF5E1F]">{formatPrice(cart.grand_total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Coupon code"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#FF5E1F]"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isLoading || !couponInput}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                                {cart.coupon_code && (
                                    <div className="mt-2 text-xs text-green-600 font-medium">
                                        Applied: {cart.coupon_code}
                                    </div>
                                )}
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href="/shop/checkout"
                                className="block w-full py-4 bg-[#FF5E1F] text-white text-center font-bold rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
