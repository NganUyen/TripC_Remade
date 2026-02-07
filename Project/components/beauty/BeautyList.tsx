"use client"

import React, { useEffect, useState } from 'react'
import { Star, Heart, Sparkles, Calendar, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { beautyApi } from '@/lib/beauty/api'
import type { VenueSearchParams } from '@/lib/beauty/types'
import { WishlistButton } from '@/components/WishlistButton'

type DisplayItem = {
    id: string
    salon: string
    service: string
    rating: number
    reviews: number
    price: number
    image: string
    badge: string | null
}

type VenueCardItem = {
    id: string
    name: string
    city: string | null
    district: string | null
    rating: number
    reviews: number
    image: string
}

const FALLBACK: DisplayItem[] = [
    { id: '1', salon: 'Lumina Hair Studio', service: 'Luxury Balayage & Cut', rating: 4.9, reviews: 320, price: 150, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop', badge: 'Bestseller' },
    { id: '2', salon: 'Glow Nail Bar', service: 'Gel Manicure & Art', rating: 4.8, reviews: 850, price: 45, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop', badge: 'Trending' },
    { id: '3', salon: 'Serenity Spa', service: 'Full Body Massage (90m)', rating: 4.9, reviews: 1200, price: 90, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop', badge: 'Relaxing' },
    { id: '4', salon: 'Modern Barber', service: 'Premium Haircut & Shave', rating: 4.7, reviews: 500, price: 35, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop', badge: null },
]

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'

export function BeautyList({ appliedFilters }: { appliedFilters: VenueSearchParams | null }) {
    const router = useRouter()
    const [items, setItems] = useState<DisplayItem[]>([])
    const [venueItems, setVenueItems] = useState<VenueCardItem[]>([])
    const [loading, setLoading] = useState(true)
    const [mode, setMode] = useState<'services' | 'venues'>('services')

    useEffect(() => {
        setLoading(true)
        if (appliedFilters && (appliedFilters.search || appliedFilters.city || (appliedFilters.categories?.length ?? 0) > 0)) {
            setMode('venues')
            beautyApi.getVenues(appliedFilters)
                .then((res) => {
                    const list: VenueCardItem[] = (res.venues ?? []).map((v) => ({
                        id: v.id,
                        name: v.name,
                        city: v.city,
                        district: v.district,
                        rating: v.average_rating ?? 0,
                        reviews: v.review_count ?? 0,
                        image: v.cover_image_url ?? DEFAULT_IMAGE,
                    }))
                    setVenueItems(list)
                    setItems([])
                })
                .catch(() => { setVenueItems([]) })
                .finally(() => setLoading(false))
        } else {
            setMode('services')
            beautyApi.getServicesListing(8)
                .then((data) => {
                    const mapped: DisplayItem[] = data.map((s) => ({
                        id: s.id,
                        salon: (s as { beauty_venues?: { name: string } }).beauty_venues?.name ?? 'Salon',
                        service: s.name,
                        rating: (s as { beauty_venues?: { average_rating: number } }).beauty_venues?.average_rating ?? 0,
                        reviews: (s as { beauty_venues?: { review_count: number } }).beauty_venues?.review_count ?? 0,
                        price: s.price,
                        image: s.image_url ?? DEFAULT_IMAGE,
                        badge: s.badge ?? null,
                    }))
                    setItems(mapped)
                    setVenueItems([])
                })
                .catch(() => setItems([]))
                .finally(() => setLoading(false))
        }
    }, [appliedFilters])

    const list = items.length > 0 ? items : FALLBACK

    const isSearchMode = mode === 'venues'

    return (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-[#1c140d] dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#FF5E1F]" />
                        {isSearchMode ? 'Search results' : 'Top Rated'}
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">
                        {isSearchMode
                            ? `${venueItems.length} venue(s) found`
                            : 'Curated beauty experiences just for you'}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] rounded-3xl md:rounded-[2rem] bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : isSearchMode ? (
                venueItems.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-12">No venues match your search. Try different keywords or location.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {venueItems.map((v, i) => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative flex flex-col gap-3 md:gap-4 rounded-3xl md:rounded-[2rem] cursor-pointer"
                                onClick={() => router.push(`/beauty/venue/${v.id}`)}
                            >
                                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl md:rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md ring-1 ring-black/5 dark:ring-white/10">
                                    <img
                                        src={v.image}
                                        alt={v.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div
                                        className="absolute top-2 right-2 md:top-4 md:right-4 z-20 scale-90 md:scale-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <WishlistButton
                                            itemId={v.id}
                                            itemType="beauty"
                                            title={v.name}
                                            imageUrl={v.image}
                                            className="bg-white/20 backdrop-blur-md border-transparent hover:bg-white text-white"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                                        <motion.span
                                            className="w-full bg-[#FF5E1F] text-white py-3.5 rounded-full font-bold shadow-xl text-center translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                                        >
                                            View services
                                        </motion.span>
                                    </div>
                                </div>
                                <div className="px-1 md:px-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate mb-0.5 md:mb-1">{v.name}</h4>
                                    {(v.city || v.district) && (
                                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5 md:mb-2">
                                            <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                            <span className="truncate">{[v.district, v.city].filter(Boolean).join(', ')}</span>
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 md:gap-1.5">
                                        <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{v.rating}</span>
                                        <span className="text-[10px] md:text-sm text-slate-400 font-medium md:font-normal">({v.reviews})</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {list.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative flex flex-col gap-3 md:gap-4 rounded-3xl md:rounded-[2rem] cursor-pointer"
                            onClick={() => router.push(`/beauty/${item.id}`)}
                        >
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl md:rounded-[2rem] bg-slate-200 dark:bg-zinc-800 shadow-md ring-1 ring-black/5 dark:ring-white/10">
                                <img
                                    src={item.image}
                                    alt={item.service}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 flex justify-between items-start z-10">
                                    {item.badge ? (
                                        <div className="bg-white/90 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold text-slate-900 shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                            <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#FF5E1F]" /> {item.badge}
                                        </div>
                                    ) : <div></div>}
                                    <div
                                        className="scale-90 md:scale-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <WishlistButton
                                            itemId={item.id}
                                            itemType="beauty"
                                            title={item.service}
                                            imageUrl={item.image}
                                            price={item.price}
                                            className="bg-white/20 backdrop-blur-md border-transparent hover:bg-white text-white"
                                        />
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-[#FF5E1F] text-white py-3.5 rounded-full font-bold shadow-xl translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" /> Book Now
                                    </motion.button>
                                </div>
                            </div>
                            <div className="px-1 md:px-2">
                                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate pr-2">{item.salon}</h4>
                                    <span className="text-lg md:text-xl font-black text-[#FF5E1F]">${item.price}</span>
                                </div>
                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2 truncate">{item.service}</p>
                                <div className="flex items-center gap-1 md:gap-1.5">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                                    <span className="text-[10px] md:text-sm text-slate-400 font-medium md:font-normal">({item.reviews})</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    )
}
