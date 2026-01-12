"use client"

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { fadeInUp } from './shared'

export function InfoCard() {
    return (
        <motion.div variants={fadeInUp} className="bg-white dark:bg-white/5 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center shrink-0 text-[#FF5E1F]">
                <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">What is Tcent?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    Tcent is your universal digital reward currency. Use it to book trips, upgrade seats, or redeem exclusive lifestyle vouchers.
                </p>
                <button className="text-sm font-bold text-[#FF5E1F] hover:underline">Learn more about tiers</button>
            </div>
        </motion.div>
    )
}
