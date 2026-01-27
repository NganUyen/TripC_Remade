"use client"

import { motion } from 'framer-motion'
import { fadeInUp } from './shared'

export function PromoBanners() {
    return (
        <motion.div variants={fadeInUp} className="space-y-4 mb-8">
            <div className="group relative overflow-hidden rounded-[2rem] p-5 h-24 flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white text-rose-600 text-[10px] font-black rounded uppercase">Live</span>
                        <h3 className="font-bold">Daily Jackpot</h3>
                    </div>
                    <p className="text-xs opacity-90">Win up to 10k Tcent today</p>
                </div>
                <button className="relative z-10 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold hover:bg-white/30 transition-colors">
                    Play Now
                </button>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] p-5 h-24 flex items-center justify-between bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/20">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white text-violet-600 text-[10px] font-black rounded uppercase">Spin</span>
                        <h3 className="font-bold">Lucky Day</h3>
                    </div>
                    <p className="text-xs opacity-90">Your free spin is ready</p>
                </div>
                <button className="relative z-10 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold hover:bg-white/30 transition-colors">
                    Spin
                </button>
            </div>
        </motion.div>
    )
}
