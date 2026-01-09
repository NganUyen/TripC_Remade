"use client"

import React from 'react'
import { Star, MapPin, Utensils, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const RESTAURANTS = [
    { id: 1, name: "Le Bernardin", rating: 4.9, price: "$$$$", cuisine: "French Seafood", image: "https://images.unsplash.com/photo-1550966871-3ed3c6227b3c?q=80&w=800&auto=format&fit=crop", match: "98%" },
    { id: 2, name: "Sushi Nakazawa", rating: 4.8, price: "$$$", cuisine: "Omakase", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop", match: "95%" },
    { id: 3, name: "Don Angie", rating: 4.7, price: "$$$", cuisine: "Italian American", image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop", match: "92%" },
    { id: 4, name: "Katz's Delicatessen", rating: 4.6, price: "$$", cuisine: "Deli", image: "https://images.unsplash.com/photo-1596529845348-1859349547d4?q=80&w=800&auto=format&fit=crop", match: "90%" },
]

export function RestaurantList() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-[#1c140d] dark:text-white">Popular Spots</h3>
                <button className="text-sm font-bold text-[#FF5E1F] hover:underline">View All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {RESTAURANTS.map((place, i) => (
                    <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
                    >
                        {/* Image Area - Taller 4:3 */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                            <img
                                src={place.image}
                                alt={place.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Match Badge */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                                {place.match} Match
                            </div>

                            {/* Floating Book Button - Appears on Hover */}
                            <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="w-12 h-12 bg-[#FF5E1F] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                    <BookOpen className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-5">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{place.name}</h4>

                            <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-slate-900 dark:text-white">{place.rating}</span>
                                </div>
                                <span>•</span>
                                <span className="text-slate-900 dark:text-white">{place.price}</span>
                                <span>•</span>
                                <span className="truncate">{place.cuisine}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
