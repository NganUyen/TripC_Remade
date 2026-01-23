"use client"

import React from 'react'
import { ArrowRight, Music, Ticket, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export function TrendingBento() {
    return (
        <section>
            <h2 className="text-3xl font-black text-[#1c140d] dark:text-white mb-8">Trending this week</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">

                {/* Card 1: Big Feature (Universal Studios) - Spans 2 Cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer"
                >
                    <img
                        src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop"
                        alt="Luxury Karaoke"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Top Rated</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Elite KTV Experience</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-slate-300 font-medium line-clamp-1 max-w-md">Private suites, butler service, and the best sound in town.</p>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column Stack */}
                <div className="flex flex-col gap-6">

                    {/* Card 2: Promo (Music Fest) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer"
                    >
                        <Music className="absolute -right-4 -top-4 w-32 h-32 text-white/10 rotate-12" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Ticket className="w-4 h-4 text-white/80" />
                                    <span className="text-xs font-bold text-white/80 uppercase">Coming Soon</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight">Rooftop Jazz Nights</h3>
                            </div>
                            <button className="bg-white/20 hover:bg-white hover:text-purple-600 text-white backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold transition-all w-fit">
                                Reserve Table
                            </button>
                        </div>
                    </motion.div>

                    {/* Card 3: Stat */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 bg-white dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-transparent dark:from-zinc-900 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-[#FF5E1F] rounded-full flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-1">500+</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Venues Booked Tonight</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
