"use client"

import React from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function ActivitiesHero() {
    const categories = ['All', 'Theme Parks', 'Water Parks', 'Museums', 'Nature', 'Tours', 'Extreme Sports']

    return (
        <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center p-4">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=2670&auto=format&fit=crop"
                    alt="Adventure"
                    className="w-full h-full object-cover"
                />
                {/* Standard Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center mt-12 md:mt-24">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-4xl md:text-6xl font-black mb-8 text-center drop-shadow-lg tracking-tight"
                >
                    Your Adventure<br />Awaits
                </motion.h1>

                {/* FLOATING CONSOLE - Search & Pills Overlapping Bottom */}
                <div className="w-full relative z-20 flex flex-col items-center gap-6">

                    {/* Search Bar */}
                    <div className="w-full max-w-xl relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search experiences, tours, and activities..."
                            className="w-full h-14 pl-12 pr-6 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Categories - Glass Pills */}
                    <div className="w-full overflow-x-auto no-scrollbar pb-4 px-4">
                        <div className="flex justify-center gap-3 w-fit min-w-full md:min-w-0">
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.05) }}
                                    className="whitespace-nowrap px-6 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-bold hover:bg-[#FF5E1F] hover:border-[#FF5E1F] backdrop-blur-sm transition-all shadow-sm"
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
