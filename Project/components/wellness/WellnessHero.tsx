"use client"

import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Leaf, Wind, Droplets, Sun } from 'lucide-react'

const categories = [
    { name: "Yoga", icon: <Leaf className="w-4 h-4" /> },
    { name: "Meditation", icon: <Wind className="w-4 h-4" /> },
    { name: "Thermal Baths", icon: <Droplets className="w-4 h-4" /> },
    { name: "Nature Walks", icon: <Sun className="w-4 h-4" /> },
    { name: "Retreats", icon: <Leaf className="w-4 h-4" /> }, // Reusing Leaf for now
]

export function WellnessHero() {
    return (
        <section className="relative w-full pb-32">
            {/* Background & Mask */}
            <div className="relative h-[600px] w-full z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2670&auto=format&fit=crop"
                    alt="Yoga and Meditation Retreat"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>

                {/* Hero Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-20 px-4">
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
                        className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-sm text-center"
                    >
                        Find Your <span className="text-green-200 font-serif italic">Center</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/90 max-w-xl mx-auto font-medium text-center"
                    >
                        Rejuvenate your mind, body, and soul with curated wellness experiences.
                    </motion.p>
                </div>
            </div>

            {/* Floating Glass Search Console */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-8 z-20 px-4">
                <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-full shadow-2xl shadow-green-900/5 flex flex-col md:flex-row gap-2"
                    >
                        {/* Experience Type */}
                        <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/50 dark:bg-slate-800/50 rounded-full border border-white/10 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all group">
                            <Leaf className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Experience (e.g., Yoga)"
                                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                            />
                        </div>

                        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                        {/* Location Input */}
                        <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/50 dark:bg-slate-800/50 rounded-full border border-white/10 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all group">
                            <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                            />
                        </div>

                        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                        {/* Dates Input */}
                        <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/50 dark:bg-slate-800/50 rounded-full border border-white/10 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all group">
                            <Calendar className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Dates"
                                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 font-medium"
                            />
                        </div>

                        {/* Search Button */}
                        <button className="md:w-16 md:h-16 w-full py-4 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
                            <Search className="w-6 h-6" />
                        </button>
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar w-full px-2 mt-6"
                    >
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm"
                            >
                                <span className="text-slate-900 dark:text-white">{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
