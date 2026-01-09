"use client"

import React, { useState } from 'react'
import { Search, ShoppingBag, Gift } from 'lucide-react'
import { motion } from 'framer-motion'

export function VoucherHero() {
    const [activeType, setActiveType] = useState('All')
    const [mode, setMode] = useState<'buy' | 'redeem'>('buy')

    const categories = ['All', 'Hotels', 'Dining', 'Activities', 'Shopping', 'Travel']

    return (
        // Aligned to match page container: px-4 lg:px-8
        <section className="relative w-full py-12">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex flex-col gap-8">

                {/* Header Text Group - Left Aligned for clean look */}
                <div className="flex flex-col gap-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Voucher Marketplace
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl"
                    >
                        Give the gift of experience or treat yourself with exclusive deals from top brands.
                    </motion.p>
                </div>

                {/* Controls Container */}
                <div className="flex flex-col gap-6">

                    {/* 1. Main Search & Action Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 items-center"
                    >
                        {/* Search Input - Enhanced shadow/border for white bg */}
                        <div className="relative flex-1 w-full md:w-auto group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by brand or category..."
                                className="w-full h-14 pl-12 pr-6 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm focus:shadow-md text-base outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Mode Toggle (Buy / Redeem) */}
                        <div className="bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 flex shrink-0">
                            <button
                                onClick={() => setMode('buy')}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${mode === 'buy' ? 'bg-[#FF5E1F] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Buy Vouchers
                            </button>
                            <button
                                onClick={() => setMode('redeem')}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${mode === 'redeem' ? 'bg-[#FF5E1F] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <Gift className="w-4 h-4" />
                                Redeem
                            </button>
                        </div>
                    </motion.div>

                    {/* 2. Category Filters (Scrollable) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full overflow-x-auto no-scrollbar pb-2"
                    >
                        <div className="flex gap-2 w-fit min-w-full md:min-w-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveType(cat)}
                                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold border transition-all 
                                    ${activeType === cat
                                            ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white shadow-md'
                                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
