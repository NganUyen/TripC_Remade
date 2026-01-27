"use client"

import React from 'react'
import { Star, Heart, Ticket, Zap, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ACTIVITIES } from '@/components/activities/mockData'

export function ActivityList() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">Trending Experiences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ACTIVITIES.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col gap-3 rounded-2xl cursor-pointer"
                    >
                        {/* Poster Image - Square Aspect Ratio */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-zinc-800 shadow-sm">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                                {item.instant && (
                                    <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 shadow-sm flex items-center gap-1">
                                        <Zap className="w-3 h-3 fill-current" /> Instant
                                    </div>
                                )}
                                <div className="ml-auto flex items-center gap-2">
                                    <button className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all pointer-events-auto group/btn">
                                        <Share2 className="w-4 h-4 text-white group-hover/btn:text-slate-900" />
                                    </button>
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors pointer-events-auto">
                                        <Heart className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Hover Overlay & Book Button Slide Up */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-[#FF5E1F] text-white px-6 py-2 rounded-full font-bold shadow-xl translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-sm"
                                >
                                    <Ticket className="w-3.5 h-3.5" /> Book Now
                                </motion.button>
                            </div>
                        </div>

                        {/* Content Details */}
                        <div className="px-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 mb-1 group-hover:text-[#FF5E1F] transition-colors">{item.title}</h3>

                            <div className="flex items-center gap-1 mb-2">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                <span className="text-xs text-slate-400">({item.reviews})</span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">From</span>
                                    {item.oldPrice && (
                                        <span className="text-xs text-slate-400 line-through decoration-slate-400 decoration-1 font-medium">${item.oldPrice}</span>
                                    )}
                                </div>
                                <span className="text-xl font-black text-[#FF5E1F]">${item.price}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
