"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeInUp } from './shared'

export function StartEarningBar() {
    return (
        <motion.div variants={fadeInUp} className="sticky bottom-4 z-30 mb-8 mx-auto max-w-md md:max-w-none">
            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-between pl-6 pr-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 hidden md:block">Want to grow your balance?</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 md:hidden">Grow your balance</span>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Close
                    </Link>
                    <button className="px-6 py-2.5 bg-[#FF5E1F] text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform active:scale-95">
                        Start Earning
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
