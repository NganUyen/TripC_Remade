"use client"

import React from 'react'
import { ChevronRight, Tag, Star, Luggage, Zap, Plane } from 'lucide-react'
import { motion } from 'framer-motion'

const VOUCHERS = [
    { id: 1, title: '$50 Off Flight', desc: 'Any international booking', color: 'bg-orange-500', Icon: Plane }, // Replaced custom icon with Lucide Plane for simplicity or consistency
    { id: 2, title: 'Free Lounge Access', desc: 'Single entry pass', color: 'bg-purple-600', Icon: Star },
    { id: 3, title: '10% Off Luggage', desc: 'Valid on TripC Shop', color: 'bg-blue-600', Icon: Luggage },
    { id: 4, title: 'Spa Day Pass', desc: 'Partner hotels only', color: 'bg-emerald-500', Icon: Zap },
]

export function VoucherStrip() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Exclusive Vouchers</h3>
                <button className="text-[#FF5E1F] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 lg:-mx-12 lg:px-12 no-scrollbar snap-x">
                {VOUCHERS.map((voucher) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={voucher.id}
                        className="snap-start shrink-0 w-80 h-40 relative flex bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden"
                    >
                        {/* Left Part */}
                        <div className={`w-24 h-full ${voucher.color} flex items-center justify-center relative`}>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-20"></div>
                            {/* Perforation dots */}
                            <div className="absolute right-0 top-0 bottom-0 w-[1px] border-r-2 border-dashed border-white/30"></div>
                            <voucher.Icon className="text-white w-8 h-8" />
                        </div>
                        {/* Right Part */}
                        <div className="flex-1 p-5 flex flex-col justify-center">
                            <h4 className="font-bold text-lg leading-tight mb-1">{voucher.title}</h4>
                            <p className="text-slate-500 text-xs mb-3">{voucher.desc}</p>
                            <button className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 w-fit hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                Claim
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
