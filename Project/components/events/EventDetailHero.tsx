"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { MapPin, Share2, Heart, Star, ChevronLeft, ChevronRight, Calendar, Music } from 'lucide-react'
import Link from 'next/link'

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1459749411177-712002f28c99?q=80&w=2670&auto=format&fit=crop", // Concert Crowd
    "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2670&auto=format&fit=crop", // Stage Lights
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670&auto=format&fit=crop", // Neon Vibes
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2670&auto=format&fit=crop"  // Festival Night
]

export function EventDetailHero() {
    const [current, setCurrent] = useState(0)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 600], [0, 200]) // Parallax Effect

    const nextSlide = () => setCurrent((prev) => (prev + 1) % HERO_IMAGES.length)
    const prevSlide = () => setCurrent((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative w-full z-0 h-[600px] mb-24 cursor-default group">
            {/* Masking Container */}
            <div className="relative h-full w-full overflow-hidden rounded-b-[2.5rem]">

                {/* Parallax Wrapper */}
                <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <motion.img
                            key={current}
                            src={HERO_IMAGES[current]}
                            alt={`Event View ${current + 1}`}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                    </AnimatePresence>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 z-10 pointer-events-none"></div>
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
                    <Link href="/events" className="pointer-events-auto w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all">
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
                        transition={{ delay: 0.2 }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Music className="w-3 h-3" /> Music Festival
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                                    All Ages
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                Summer Vibes 2026
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#FF5E1F]" />
                                    <span>Aug 12-14, 2026</span>
                                </div>
                                <span className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#FF5E1F]" />
                                    <span>Central Park, NY</span>
                                    <Link href="#" className="text-xs font-bold underline hover:text-[#FF5E1F] ml-1">Map</Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Interested</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">12.5k</p>
                            </div>
                            <div className="w-14 h-14 bg-[#FF5E1F] rounded-2xl rounded-tr-sm flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
                                <Heart className="w-6 h-6 fill-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
