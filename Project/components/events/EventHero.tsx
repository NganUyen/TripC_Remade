"use client"

import React from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function EventHero() {
    const categories = ['Live Music', 'Theater', 'Sports', 'Exhibitions', 'Conferences', 'Festivals']

    return (
        <section className="relative min-h-[500px] w-full flex flex-col items-center justify-center p-4">
            {/* Background Image & Overlay - Cinematic Contrast */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="w-full h-full"
                >
                    <img
                        src="https://images.unsplash.com/photo-1459749411177-712002f28c99?q=80&w=2670&auto=format&fit=crop"
                        alt="Concert Events"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                {/* Studio Vignette Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-50% to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
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
                            className="w-full h-14 pl-14 pr-6 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-4 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]/50 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Categories - Shop Style with Cinematic Adaptation */}
                <div className="mt-20 w-full overflow-visible z-10 relative">
                    <div className="flex justify-center gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                className="whitespace-nowrap px-4 py-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
