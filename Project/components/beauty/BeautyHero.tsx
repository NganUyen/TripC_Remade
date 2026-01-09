"use client"

import React from 'react'
import { Search, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export function BeautyHero() {
    const categories = ['All', 'Hair', 'Nails', 'Facial', 'Massage', 'Barber', 'Makeup', 'Spa']

    return (
        <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center pt-24 pb-12 px-4">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2669&auto=format&fit=crop"
                    alt="Luxury Spa"
                    className="w-full h-full object-cover"
                />
                {/* Soft Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-8 md:mt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-4xl md:text-7xl font-black mb-6 text-center drop-shadow-xl tracking-tight leading-tight"
                >
                    Redefine Your <span className="text-orange-200 italic font-serif">Glow</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-white/90 text-lg md:text-xl font-medium text-center max-w-2xl mb-10 drop-shadow-md"
                >
                    Book top-rated salons, spas, and wellness experiences near you.
                </motion.p>

                {/* FLOATING CONSOLE - Search & Pills Overlapping Bottom */}
                <div className="w-full flex flex-col items-center gap-6">

                    {/* Search Bar - Glass Pill with Split Inputs */}
                    <div className="w-full max-w-3xl relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-full shadow-2xl p-2.5 flex flex-col md:flex-row items-center gap-2 border border-white/20 dark:border-zinc-800">

                        {/* Input 1: Service */}
                        <div className="flex-1 flex items-center px-4 h-12 w-full group">
                            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Service or Salon name..."
                                className="bg-transparent w-full h-full outline-none text-slate-900 dark:text-white placeholder:text-slate-500 font-medium"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-zinc-700"></div>

                        {/* Input 2: Location */}
                        <div className="flex-1 flex items-center px-4 h-12 w-full group">
                            <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Location (e.g., District 1)"
                                className="bg-transparent w-full h-full outline-none text-slate-900 dark:text-white placeholder:text-slate-500 font-medium"
                            />
                        </div>

                        {/* Search Button */}
                        <button className="w-full md:w-auto px-8 h-12 bg-[#FF5E1F] rounded-full text-white font-bold hover:bg-[#e04f18] transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95">
                            Search
                        </button>
                    </div>

                    {/* Categories - Glass Pills */}
                    <div className="w-full overflow-x-auto no-scrollbar pb-2 px-4 mask-fade-sides">
                        <div className="flex justify-center gap-3 w-fit min-w-full md:min-w-0 px-4">
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="whitespace-nowrap px-6 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-bold hover:bg-[#FF5E1F] hover:border-[#FF5E1F] backdrop-blur-md transition-all shadow-sm hover:scale-105"
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
