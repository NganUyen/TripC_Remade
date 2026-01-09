"use client"

import React from 'react'
import { Star, Heart, Ticket, Zap, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ACTIVITIES = [
    { id: 1, title: "Universal Studios VIP Experience", rating: 4.9, reviews: 1200, price: 189, oldPrice: 250, image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop", instant: true },
    { id: 2, title: "Sunset Catamaran Cruise with Dinner", rating: 4.8, reviews: 850, price: 85, oldPrice: 120, image: "https://images.unsplash.com/photo-1544642055-32e67f0b5402?q=80&w=800&auto=format&fit=crop", instant: true },
    { id: 3, title: "Desert Safari & Dune Bashing", rating: 4.7, reviews: 2000, price: 65, oldPrice: 90, image: "https://images.unsplash.com/photo-1451337516015-6b6fcd1c9015?q=80&w=800&auto=format&fit=crop", instant: true },
    { id: 4, title: "Museum of Future Entry Ticket", rating: 4.6, reviews: 500, price: 45, oldPrice: 60, image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop", instant: false },
    { id: 5, title: "Scuba Diving for Beginners", rating: 4.9, reviews: 320, price: 120, oldPrice: 150, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop", instant: true },
    { id: 6, title: "City Helicopter Tour (15 Mins)", rating: 4.8, reviews: 150, price: 299, oldPrice: 350, image: "https://images.unsplash.com/photo-1561569766-0db941916892?q=80&w=800&auto=format&fit=crop", instant: false },
    { id: 7, title: "Disneyland 1-Day Pass", rating: 4.9, reviews: 5000, price: 145, oldPrice: 160, image: "https://images.unsplash.com/photo-1510425278-65476a61a0d3?q=80&w=800&auto=format&fit=crop", instant: true },
    { id: 8, title: "Cooking Class with Local Chef", rating: 4.7, reviews: 400, price: 55, oldPrice: 75, image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=800&auto=format&fit=crop", instant: true },
]

export function ActivityList() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">Trending Experiences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {ACTIVITIES.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col gap-4 rounded-[2rem] cursor-pointer"
                    >
                        {/* Poster Image - 4:5 Aspect Ratio */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                {item.instant && (
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
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-[#FF5E1F] text-white px-8 py-3 rounded-full font-bold shadow-xl translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Ticket className="w-4 h-4" /> Book Now
                                </motion.button>
                            </div>
                        </div>

                        {/* Content Details */}
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[#FF5E1F] transition-colors">{item.title}</h3>

                            <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                <span className="text-sm text-slate-400">({item.reviews})</span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold">From</span>
                                    <span className="text-sm text-slate-400 line-through decoration-slate-400 decoration-1 font-medium">${item.oldPrice}</span>
                                </div>
                                <span className="text-2xl font-black text-[#FF5E1F]">${item.price}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
