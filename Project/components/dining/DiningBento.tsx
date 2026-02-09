"use client"

import React from 'react'
import { ArrowUpRight, Flame, Moon, Map } from 'lucide-react'
import { motion } from 'framer-motion'

export function DiningBento() {
    return (
        <section>
            <h2 className="text-3xl font-black text-[#1c140d] dark:text-white mb-8">Curated Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">

                {/* Card 1: Trending (Chef Plating) - Large Vertical */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-1 relative h-[300px] md:h-full rounded-3xl md:rounded-[2rem] overflow-hidden group cursor-pointer"
                >
                    <img
                        src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
                        alt="Trending Restaurants"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF5E1F] rounded-full flex items-center justify-center text-white mb-3 md:mb-4">
                            <Flame className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-1">Trending Now</h3>
                        <p className="text-slate-300 text-xs md:text-sm font-medium">The most booked tables this week.</p>
                    </div>
                </motion.div>

                {/* Middle Column Stack */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">

                    {/* Card 2: Late Night (Neon) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative h-full min-h-[220px] md:min-h-[250px] bg-slate-900 rounded-3xl md:rounded-[2rem] overflow-hidden group cursor-pointer"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=1000&auto=format&fit=crop"
                            alt="Late Night"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute top-4 left-4 md:top-6 md:left-6">
                            <div className="bg-purple-600/20 backdrop-blur-md border border-purple-500/50 text-purple-200 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
                                <Moon className="w-3 h-3" /> Late Night
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                            <h3 className="text-xl md:text-2xl font-black text-white">After Hours</h3>
                        </div>
                    </motion.div>

                    {/* Card 3: Local Gems (Minimal) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative h-full min-h-[220px] md:min-h-[250px] bg-[#f0f4f8] dark:bg-zinc-800 rounded-3xl md:rounded-[2rem] p-4 md:p-6 flex flex-col justify-between group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-colors"
                    >
                        <div>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-zinc-700 rounded-2xl flex items-center justify-center shadow-sm mb-3 md:mb-4">
                                <Map className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Local Gems</h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-xs md:text-sm font-medium">Discover hidden spots <br />loved by locals.</p>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 dark:border-zinc-600 flex items-center justify-center group-hover:bg-[#FF5E1F] group-hover:border-[#FF5E1F] group-hover:text-white transition-all">
                                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
