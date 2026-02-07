"use client"

import React, { useEffect, useState } from 'react'
import { Star, MapPin, Utensils, BookOpen } from 'lucide-react'
import { WishlistButton } from '@/components/WishlistButton'
import { motion } from 'framer-motion'
import { diningApi } from '@/lib/dining/api'
import type { DiningVenue } from '@/lib/dining/types'
import Link from 'next/link'

export function RestaurantList() {
    const [restaurants, setRestaurants] = useState<DiningVenue[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const result = await diningApi.getVenues({ limit: 8 })
                setRestaurants(result.venues)
            } catch (error) {
                console.error('Error fetching restaurants:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRestaurants()
    }, [])

    const getPriceRangeDisplay = (priceRange: string | null) => {
        if (!priceRange) return '$$'
        const map: Record<string, string> = {
            budget: '$',
            moderate: '$$',
            upscale: '$$$',
            fine_dining: '$$$$',
        }
        return map[priceRange] || '$$'
    }

    const getCuisineDisplay = (cuisines: string[] | null) => {
        if (!cuisines || cuisines.length === 0) return 'Restaurant'
        return cuisines[0]
    }
    if (loading) {
        return (
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-[#1c140d] dark:text-white">Popular Spots</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#18181b] rounded-3xl md:rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800 animate-pulse">
                            <div className="aspect-[4/3] bg-slate-200 dark:bg-zinc-800" />
                            <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                                <div className="h-4 md:h-5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
                                <div className="h-3 md:h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-[#1c140d] dark:text-white">Popular Spots</h3>
                <Link href="/dining" className="text-sm font-bold text-[#FF5E1F] hover:underline">View All</Link>
            </div>

            {restaurants.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <p>No restaurants found. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {restaurants.map((place, i) => (
                        <Link key={place.id} href={`/dining/${place.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="group bg-white dark:bg-[#18181b] rounded-3xl md:rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image Area - Taller 4:3 */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <img
                                        src={place.cover_image_url || "https://images.unsplash.com/photo-1550966871-3ed3c6227b3c?q=80&w=800&auto=format&fit=crop"}
                                        alt={place.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Featured Badge */}
                                    {place.is_featured && (
                                        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-emerald-600 shadow-sm">
                                            Featured
                                        </div>
                                    )}

                                    {/* Wishlist Button */}
                                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 scale-90 md:scale-100">
                                        <WishlistButton
                                            itemId={place.id}
                                            itemType="dining"
                                            title={place.name}
                                            imageUrl={place.cover_image_url || undefined}
                                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border hover:bg-white"
                                        />
                                    </div>

                                    {/* Floating Book Button - Appears on Hover */}
                                    <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
                                        <div className="w-12 h-12 bg-[#FF5E1F] rounded-full flex items-center justify-center text-white shadow-lg">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-3 md:p-5">
                                    <h4 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 line-clamp-1">{place.name}</h4>

                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-0.5 md:gap-1 text-amber-500">
                                            <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                                            <span className="text-slate-900 dark:text-white">{place.average_rating.toFixed(1)}</span>
                                        </div>
                                        <span className="hidden md:inline">•</span>
                                        <span className="text-slate-900 dark:text-white">{getPriceRangeDisplay(place.price_range)}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="truncate max-w-[60px] md:max-w-none">{getCuisineDisplay(place.cuisine_type)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
