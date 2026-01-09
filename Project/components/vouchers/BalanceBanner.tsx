"use client"

import React from 'react'
import { Wallet, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function BalanceBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 to-violet-600 p-8 md:p-12 shadow-2xl"
        >
            {/* Watermark Icon */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
                <Wallet className="w-64 h-64 text-white rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-white/80 mb-2 font-medium">
                        <div className="p-1.5 bg-white/20 rounded-full">
                            <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <span>Available Balance</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">0 <span className="text-2xl md:text-4xl opacity-50 font-bold">Points</span></h2>
                </div>

                <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Top Up Balance
                </button>
            </div>
        </motion.div>
    )
}
