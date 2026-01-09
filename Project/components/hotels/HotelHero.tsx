"use client"

import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Search } from 'lucide-react'

export function HotelHero() {
    return (
        <section className="relative w-full pb-24">
            {/* Background & Mask */}
            <div className="absolute inset-0 h-[500px] w-full z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Resort Pool"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40">
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-sm">
                            Find Your <span className="text-orange-500">Escape</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-sm">
                            Discover exquisite stays and exclusive deals for your next getaway.
                        </p>
                    </motion.div>

                    {/* Floating Search Console */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-[2rem] shadow-xl shadow-orange-500/5 mb-8"
                    >
                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
                            {/* Destination */}
                            <div className="flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group">
                                <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">Da Nang, Vietnam</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Popular costal city</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group">
                                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in — Check-out</p>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">May 12 - May 15</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">3 nights • Weekend</p>
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative">
                                <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">2 Adults, 1 Room</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Standard Room</p>
                                </div>

                                <button className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 size-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95">
                                    <Search className="w-7 h-7" />
                                </button>
                            </div>

                            {/* Mobile Search Button */}
                            <div className="lg:hidden p-2 pt-4">
                                <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                                    <Search className="w-5 h-5" />
                                    Search Hotels
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
