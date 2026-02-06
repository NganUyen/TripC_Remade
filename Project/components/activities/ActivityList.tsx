"use client"

import React from 'react'
import { Star, Heart, Ticket, Zap, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { WishlistButton } from '@/components/WishlistButton'
import { toast } from 'sonner'

interface ActivityListProps {
    activities: Activity[]
    wishlistIds?: string[]
}

export function ActivityList({ activities, wishlistIds = [] }: ActivityListProps) {
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {activities.map((item, i) => (
                    <Link href={`/activities/${slugify(item.title)}-${item.id}`} key={item.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative flex flex-col gap-3 md:gap-4 rounded-xl md:rounded-[2rem] cursor-pointer"
                        >
                            {/* Poster Image - 4:5 Aspect Ratio */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl md:rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Top Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                    {item.is_instant && (
                                        <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-amber-600 shadow-sm flex items-center gap-1">
                                            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> Instant
                                        </div>
                                    )}
                                    <div
                                        className="absolute top-4 right-4 z-10"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <WishlistButton
                                            itemId={item.id}
                                            itemType="activity"
                                            title={item.title}
                                            imageUrl={item.image_url}
                                            price={item.price}
                                            initialInWishlist={wishlistIds.includes(item.id)}
                                            className="bg-white/20 backdrop-blur-md border-transparent hover:bg-white text-white"
                                        />
                                    </div>
                                </div>

                                {/* Hover Overlay & Book Button Slide Up */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2 md:pb-6 group-hover:bg-black/20 transition-all duration-300">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toast.info("Booking flow coming soon!")
                                        }}
                                        className="bg-[#FF5E1F] text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold shadow-xl translate-y-0 md:translate-y-10 md:group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 md:gap-2 text-[10px] md:text-base w-auto mx-auto justify-center min-w-[100px]"
                                    >
                                        <Ticket className="w-3 h-3 md:w-4 md:h-4" /> Book Now
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content Details */}
                            <div className="px-1 md:px-0">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg leading-tight line-clamp-2 mb-1 md:mb-2 group-hover:text-[#FF5E1F] transition-colors">{item.title}</h3>

                                <div className="flex items-center gap-1 mb-1 md:mb-3">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-400 fill-current" />
                                    <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                    <span className="text-[10px] md:text-sm text-slate-400">({item.reviews_count})</span>
                                </div>

                                <div className="flex items-baseline justify-between">
                                    <div className="flex flex-col">
                                        {item.old_price && (
                                            <>
                                                <span className="text-[10px] md:text-xs text-slate-400 font-bold">From</span>
                                                <span className="text-xs md:text-sm text-slate-400 line-through decoration-slate-400 decoration-1 font-medium">${item.old_price}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-lg md:text-2xl font-black text-[#FF5E1F]">${item.price}</span>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
