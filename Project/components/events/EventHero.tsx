"use client"

import React from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function EventHero() {
    const categories = ['Live Music', 'Theater', 'Sports', 'Exhibitions', 'Conferences', 'Festivals']

    return (
        <section className="relative min-h-[500px] w-full flex flex-col items-center justify-center p-4">
            {/* Background Image & Overlay - MATCHING SHOP/ENTERTAINMENT STYLE */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2669&auto=format&fit=crop"
                    alt="Concert Events"
                    className="w-full h-full object-cover opacity-90"
                />
                {/* Lighter Gradient 40-20 to match refined ShopHero */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center mt-12 md:mt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-4xl md:text-5xl font-black mb-8 text-center drop-shadow-md"
                >
                    Discover Events
                </motion.h1>

                {/* Search Console */}
                <div className="w-full relative z-20 px-2 md:px-0">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for events, artists, or venues..."
                            className="w-full h-14 pl-14 pr-6 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Categories - Matched Layout */}
                <div className="mt-20 w-full overflow-visible z-10 relative">
                    <div className="flex justify-center gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
                        {categories.map((cat, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                                className="whitespace-nowrap px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-bold hover:bg-white/20 backdrop-blur-sm transition-colors shadow-sm"
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
