"use client"

import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'

export function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto mb-10"
        >
            <div className="relative overflow-hidden rounded-3xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* Content */}
                <div className="flex-1 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#FF5E1F] shadow-sm shrink-0">
                        <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            Ready to start your journey?
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                            Tap the heart icon on any hotel, tour, or restaurant to save your favorites here.
                        </p>
                    </div>
                </div>

                {/* Action */}
                <button className="h-12 px-6 rounded-full bg-[#FF5E1F] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                    Explore Trending Destinations
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    )
}
