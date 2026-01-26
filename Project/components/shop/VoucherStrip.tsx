"use client"

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Gift, Star, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import { useVouchers, formatPriceSimple } from '@/lib/hooks/useShopAPI'

// Icon mapping for voucher types
const VOUCHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    default: Gift,
    fixed: Ticket,
    percent: Star,
}

const VOUCHER_COLORS = [
    'bg-orange-500',
    'bg-purple-600',
    'bg-blue-600',
    'bg-emerald-500',
]

export function VoucherStrip() {
    const { vouchers, loading, error } = useVouchers();

    // Loading skeleton
    if (loading) {
        return (
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Exclusive Vouchers</h3>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 lg:-mx-12 lg:px-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="snap-start shrink-0 w-80 h-40 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </section>
        )
    }

    // Error or empty state
    if (error || vouchers.length === 0) {
        return null; // Hide section if no vouchers
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Exclusive Vouchers</h3>
                <Link
                    href="/shop/vouchers"
                    className="text-[#FF5E1F] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                >
                    View All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 lg:-mx-12 lg:px-12 no-scrollbar snap-x">
                {vouchers.map((voucher, index) => {
                    const Icon = VOUCHER_ICONS[voucher.discount_mode] || VOUCHER_ICONS.default;
                    const color = VOUCHER_COLORS[index % VOUCHER_COLORS.length];
                    const discountText = voucher.discount_mode === 'percent'
                        ? `${voucher.discount_value}% Off`
                        : `$${formatPriceSimple(voucher.discount_value)} Off`;

                    return (
                        <motion.div
                            whileHover={{ y: -5 }}
                            key={voucher.id}
                            className="snap-start shrink-0 w-80 h-40 relative flex bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden"
                        >
                            {/* Left Part */}
                            <div className={`w-24 h-full ${color} flex items-center justify-center relative`}>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-20"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-[1px] border-r-2 border-dashed border-white/30"></div>
                                <Icon className="text-white w-8 h-8" />
                            </div>

                            {/* Right Part */}
                            <div className="flex-1 p-5 flex flex-col justify-center">
                                <h4 className="font-bold text-lg leading-tight mb-1">{voucher.title}</h4>
                                <p className="text-slate-500 text-xs mb-1">{voucher.description}</p>
                                <p className="text-[#FF5E1F] text-sm font-bold mb-3">{discountText}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{voucher.tcent_cost} TripCent</span>
                                    <Link
                                        href="/shop/vouchers"
                                        className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Redeem
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}
