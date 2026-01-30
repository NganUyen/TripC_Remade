"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Ticket, Tag, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/hooks/useShopAPI'

export function MarketplaceActions() {
    // Subscribe to only what we need from cart store
    const cart = useCartStore((state) => state.cart);
    const isLoading = useCartStore((state) => state.isLoading);

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">

            {/* Voucher Banner - Spans 2 Columns */}
            <Link
                href="/shop/vouchers"
                className="md:col-span-2 relative h-full min-h-[220px] rounded-[2rem] overflow-hidden group cursor-pointer block"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Ticket className="w-32 h-32 rotate-12 text-white" />
                </div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-center items-start">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/20 mb-3">
                        <Tag className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Limited Time</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">TripC Vouchers</h3>
                    <p className="text-white/80 mb-4 max-w-sm">Save big on your next adventure. Up to 40% off partnered flights & hotels.</p>
                    <span className="bg-white text-indigo-900 px-5 py-2 rounded-full text-sm font-bold group-hover:bg-indigo-50 transition-colors flex items-center gap-2 mt-auto">
                        Browse Vouchers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </Link>

            {/* Cart Summary - Spans 1 Column */}
            <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-8 border border-slate-100 dark:border-zinc-800 flex flex-col justify-between relative overflow-hidden h-full min-h-[220px]">
                <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10">
                    <ShoppingBag className="w-24 h-24 -rotate-12" />
                </div>
                <div>
                    <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Your Shopping Bag</div>
                    <h3 className="text-4xl font-black text-[#1c140d] dark:text-white">
                        {isLoading ? '...' : `${cart?.item_count || 0} Item${(cart?.item_count || 0) !== 1 ? 's' : ''}`}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2">
                        Subtotal: <span className="text-[#FF5E1F] font-bold text-base">
                            {cart ? formatPrice(cart.subtotal) : '$0.00'}
                        </span>
                    </p>
                </div>
                <Link
                    href="/shop/cart"
                    className="w-full bg-[#1c140d] dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold mt-6 hover:opacity-90 transition-opacity text-center block"
                >
                    {cart && cart.item_count > 0 ? 'Checkout Now' : 'View Cart'}
                </Link>
            </div>
        </section>
    )
}
