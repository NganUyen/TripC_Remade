"use client"

import { Sparkles, Calendar, Wind } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProductOverviewProps {
    description: string
    aiInsight: {
        match: string
        reason: string
        bestTime: string
        tip: string
    }
}

export function ProductOverview({ description, aiInsight }: ProductOverviewProps) {
    return (
        <div className="space-y-8">
            {/* AI Insight Card */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/80 to-slate-50/50 dark:from-slate-900/80 dark:to-slate-900/50 border border-emerald-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-emerald-500/20">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent uppercase tracking-wider">TripC AI Insight</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{aiInsight.match}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">Great Choice</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {aiInsight.reason}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 border-l border-emerald-500/10 pl-0 md:pl-6">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-emerald-500 mt-1" />
                            <div>
                                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Best Time</span>
                                <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{aiInsight.bestTime}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Wind className="w-4 h-4 text-emerald-500 mt-1" />
                            <div>
                                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Pro Tip</span>
                                <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{aiInsight.tip}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this experience</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    {description}
                </p>
                <button className="mt-2 text-[#FF5E1F] font-bold text-sm hover:underline">Read more</button>
            </div>
        </div>
    )
}
