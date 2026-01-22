"use client"

import React from 'react'
import { Star, Heart, Sparkles, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const SERVICES = [
    {
        id: 1,
        salon: "Lumina Hair Studio",
        service: "Luxury Balayage & Cut",
        rating: 4.9,
        reviews: 320,
        price: 150,
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop",
        badge: "Bestseller"
    },
    {
        id: 2,
        salon: "Glow Nail Bar",
        service: "Gel Manicure & Art",
        rating: 4.8,
        reviews: 850,
        price: 45,
        image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop",
        badge: "Trending"
    },
    {
        id: 3,
        salon: "Serenity Spa",
        service: "Full Body Massage (90m)",
        rating: 4.9,
        reviews: 1200,
        price: 90,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop",
        badge: "Relaxing"
    },
    {
        id: 4,
        salon: "Modern Barber",
        service: "Premium Haircut & Shave",
        rating: 4.7,
        reviews: 500,
        price: 35,
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop",
        badge: null
    },
]

export function BeautyList() {
    const router = useRouter()
    return (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-[#1c140d] dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#FF5E1F]" /> Top Rated
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">Curated beauty experiences just for you</p>
                </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {SERVICES.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col gap-4 rounded-[2rem] cursor-pointer"
                        onClick={() => router.push(`/beauty/${item.id}`)}
                    >
                        {/* Lookbook Image - 4:5 Aspect Ratio */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md ring-1 ring-black/5 dark:ring-white/10">
                            <img
                                src={item.image}
                                alt={item.service}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                {item.badge ? (
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3 text-[#FF5E1F]" /> {item.badge}
                                    </div>
                                ) : <div></div>}
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 hover:border-white transition-all pointer-events-auto shadow-sm text-white">
                                    <Heart className="w-5 h-5 stroke-2" />
                                </div>
                            </div>

                            {/* Hover Overlay & Book Button Slide Up */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-[#FF5E1F] text-white py-3.5 rounded-full font-bold shadow-xl translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" /> Book Now
                                </motion.button>
                            </div>
                        </div>

                        {/* Content Details */}
                        <div className="px-2">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate pr-2">{item.salon}</h4>
                                <span className="text-xl font-black text-[#FF5E1F]">${item.price}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 truncate">{item.service}</p>

                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                <span className="text-sm text-slate-400">({item.reviews} reviews)</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
