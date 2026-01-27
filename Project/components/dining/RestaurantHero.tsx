"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Share2, Heart, Star, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { diningApi } from '@/lib/dining/api'
import type { DiningVenue } from '@/lib/dining/types'

interface RestaurantHeroProps {
    venueId?: string
}

export function RestaurantHero({ venueId }: RestaurantHeroProps) {
    const [venue, setVenue] = useState<DiningVenue | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (venueId) {
            async function fetchVenue() {
                try {
                    const data = await diningApi.getVenueById(venueId)
                    setVenue(data)
                } catch (error) {
                    console.error('Error fetching venue:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchVenue()
        } else {
            setLoading(false)
        }
    }, [venueId])

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
        return cuisines.join(', ')
    }
    if (loading) {
        return (
            <section className="relative w-full mb-24">
                <div className="h-[500px] w-full relative z-0 overflow-hidden rounded-b-[2.5rem] bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            </section>
        )
    }

    const displayVenue = venue || {
        name: 'Restaurant',
        cuisine_type: null,
        price_range: null,
        average_rating: 0,
        review_count: 0,
        location_summary: 'Location',
        cover_image_url: 'https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop',
    }

    return (
        <section className="relative w-full mb-24">
            {/* Tall Hero Image Container with Mask */}
            <div className="h-[500px] w-full relative z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src={displayVenue.cover_image_url || "https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop"}
                    alt={displayVenue.name}
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
                            {displayVenue.cuisine_type && displayVenue.cuisine_type.length > 0 && (
                                <span className="px-3 py-1 bg-[#FF5E1F]/10 text-[#FF5E1F] rounded-full text-xs font-bold uppercase tracking-wider">
                                    {getCuisineDisplay(displayVenue.cuisine_type)}
                                </span>
                            )}
                            <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                                {getPriceRangeDisplay(displayVenue.price_range)}
                            </span>
                            {displayVenue.is_verified && (
                                <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Verified
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{displayVenue.name}</h1>

                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-slate-900 dark:text-white font-bold">{displayVenue.average_rating.toFixed(1)}</span>
                                <span className="text-slate-400">({displayVenue.review_count} Review{displayVenue.review_count !== 1 ? 's' : ''})</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{displayVenue.location_summary || displayVenue.address || 'Location'}</span>
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
