"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { MapPin, Share2, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2574&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c87295ecc056?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-68c47e90c885?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop"
]

interface HotelDetailHeroProps {
    hotel: any
}

export function HotelDetailHero({ hotel }: HotelDetailHeroProps) {
    // Extract images from hotel data
    const getHotelImages = () => {
        if (!hotel?.images) return FALLBACK_IMAGES
        
        if (Array.isArray(hotel.images)) {
            if (hotel.images.length === 0) return FALLBACK_IMAGES
            // Handle both string arrays and object arrays
            const imageUrls = hotel.images.map((img: any) => 
                typeof img === 'string' ? img : img?.url || img?.image_url
            ).filter(Boolean)
            return imageUrls.length > 0 ? imageUrls : FALLBACK_IMAGES
        }
        
        return FALLBACK_IMAGES
    }
    
    const HERO_IMAGES = getHotelImages()
    const [current, setCurrent] = useState(0)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 600], [0, 200]) // Parallax Effect

    const nextSlide = () => setCurrent((prev) => (prev + 1) % HERO_IMAGES.length)
    const prevSlide = () => setCurrent((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [HERO_IMAGES.length])

    return (
        <section className="relative w-full z-0 h-[600px] mb-24 cursor-default group">
            {/* Masking Container */}
            <div className="relative h-full w-full overflow-hidden rounded-b-[2.5rem]">

                {/* Parallax Wrapper */}
                <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.img
                            key={current}
                            src={HERO_IMAGES[current]}
                            alt={`Resort View ${current + 1}`}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                    </AnimatePresence>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10 z-10 pointer-events-none"></div>
                </motion.div>

                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between p-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-2 mb-8 pointer-events-none">
                    {HERO_IMAGES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-2 h-2 rounded-full transition-all pointer-events-auto shadow-sm ${current === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                {/* Top Overlay Controls */}
                <div className="absolute top-0 left-0 w-full p-4 sm:p-8 flex justify-between items-start z-30 pt-24 pointer-events-none">
                    <Link href="/hotels" className="pointer-events-auto w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex gap-3 pointer-events-auto">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                            <Heart className="w-5 h-5 fill-transparent hover:fill-red-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Glass Title Panel */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-40 px-4 pointer-events-none">
                <div className="max-w-6xl mx-auto pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-800/50 rounded-[2rem] p-6 md:p-8 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {[...Array(hotel?.star_rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        {hotel?.star_rating || 5} Star Hotel
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                                    {hotel?.name || 'Luxury Resort'}
                                </h1>
                                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                    {hotel?.address?.city || 'Vietnam'}, {hotel?.address?.country || 'Vietnam'}
                                </p>
                            </div>
                            <div className="hidden md:block text-right">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl mb-2 inline-block">
                                    <p className="text-2xl font-black">{hotel?.reviews?.average_rating?.toFixed(1) || '9.2'}</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Exceptional</p>
                                <p className="text-xs text-slate-500">{hotel?.reviews?.count || 0} reviews</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
