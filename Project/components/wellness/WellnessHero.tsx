"use client"

import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Leaf, Wind, Droplets, Sun } from 'lucide-react'

const categories = [
    { name: "Yoga", icon: <Leaf className="w-4 h-4" /> },
    { name: "Meditation", icon: <Wind className="w-4 h-4" /> },
    { name: "Thermal Baths", icon: <Droplets className="w-4 h-4" /> },
    { name: "Nature Walks", icon: <Sun className="w-4 h-4" /> },
    { name: "Retreats", icon: <Leaf className="w-4 h-4" /> },
]

export function WellnessHero() {
    return (
        <section className="relative min-h-[600px] w-full flex flex-col items-center justify-center p-4 pt-24 md:pt-32 pb-12">
            {/* Background & Mask */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2670&auto=format&fit=crop"
                    alt="Yoga and Meditation Retreat"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6"
                >
                    <Leaf className="w-4 h-4 text-green-300" />
                    <span className="text-sm font-medium tracking-wide">Wellness & Balance</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-md text-center"
                >
                    Find Your <span className="text-green-200 font-serif italic">Center</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-white/90 max-w-xl mx-auto font-medium text-center mb-10"
                >
                    Rejuvenate your mind, body, and soul with curated wellness experiences.
                </motion.p>

                {/* Search Console */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-2"
                >
                    {/* Experience Type */}
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-transparent focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all group">
                        <Leaf className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Experience (e.g., Yoga)"
                            className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                        />
                    </div>

                    <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                    {/* Location Input */}
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-transparent focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all group">
                        <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Location"
                            className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                        />
                    </div>

                    <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                    {/* Dates Input */}
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-transparent focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all group">
                        <Calendar className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Dates"
                            className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                        />
                    </div>

                    {/* Search Button */}
                    <button className="md:w-auto md:px-8 w-full py-4 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        <Search className="w-6 h-6" />
                        <span className="md:hidden">Search</span>
                    </button>
                </motion.div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-8 no-scrollbar w-full px-2"
                >
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            className="flex items-center gap-2 whitespace-nowrap px-5 py-2.5 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm"
                        >
                            <span className="text-slate-900 dark:text-white">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
