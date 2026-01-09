"use client"

import React from 'react'
import { ArrowLeft, Share2, Heart, Star, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function RestaurantHero() {
    return (
        <section className="relative w-full mb-24">
            {/* Tall Hero Image Container with Mask */}
            <div className="h-[500px] w-full relative z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop"
                    alt="Restaurant Interior"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

                {/* Top Action Bar */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                    <Link href="/dining">
                        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </Link>
                    <div className="flex gap-4">
                        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Info Card - Overlapping Bottom Curve */}
            <div className="absolute -bottom-16 w-full px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-[1200px] mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#FF5E1F]/10 text-[#FF5E1F] rounded-full text-xs font-bold uppercase tracking-wider">Vietnamese Fusion</span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">$$$</span>
                            <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Michelin Guide
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">Madame Vo's Kitchen</h1>

                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-slate-900 dark:text-white font-bold">4.9</span>
                                <span className="text-slate-400">(2.3k Review)</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>Da Nang, Vietnam</span>
                            </div>
                        </div>
                    </div>

                    <button className="px-6 py-3 border-2 border-[#FF5E1F] text-[#FF5E1F] rounded-full font-bold hover:bg-[#FF5E1F] hover:text-white transition-all">
                        + Follow Restaurant
                    </button>
                </motion.div>
            </div>
        </section>
    )
}
