"use client"

import React from 'react'
import { Star, Heart, Ticket, Zap, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface ActivityListProps {
    activities: Activity[]
}

export function ActivityList({ activities }: ActivityListProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No activities found.</p>
            </div>
        )
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">Trending Experiences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {activities.map((item, i) => (
                    <Link href={`/activities/${slugify(item.title)}-${item.id}`} key={item.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative flex flex-col gap-4 rounded-[2rem] cursor-pointer"
                        >
                            {/* Poster Image - 4:5 Aspect Ratio */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Top Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                    {item.is_instant && (
                                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-600 shadow-sm flex items-center gap-1">
                                            <Zap className="w-3 h-3 fill-current" /> Instant
                                        </div>
                                    )}
                                    <div className="ml-auto w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors pointer-events-auto">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Hover Overlay & Book Button Slide Up */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-[#FF5E1F] text-white px-8 py-3 rounded-full font-bold shadow-xl translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <Ticket className="w-4 h-4" /> Book Now
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content Details */}
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[#FF5E1F] transition-colors">{item.title}</h3>

                                <div className="flex items-center gap-1 mb-3">
                                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                    <span className="text-sm text-slate-400">({item.reviews_count})</span>
                                </div>

                                <div className="flex items-baseline justify-between">
                                    <div className="flex flex-col">
                                        {item.old_price && (
                                            <>
                                                <span className="text-xs text-slate-400 font-bold">From</span>
                                                <span className="text-sm text-slate-400 line-through decoration-slate-400 decoration-1 font-medium">${item.old_price}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-2xl font-black text-[#FF5E1F]">${item.price}</span>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
