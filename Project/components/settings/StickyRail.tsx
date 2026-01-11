"use client"

import { motion } from 'framer-motion'
import { Sparkles, Shield, CheckCircle2 } from 'lucide-react'
import { fadeInUp } from './InternalComponents'

export function StickyRail() {
    return (
        <div className="hidden lg:block space-y-6 sticky top-24">
            {/* AI Assistant Mini */}
            <motion.div
                variants={fadeInUp}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-lg overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <Sparkles className="w-8 h-8 mb-4 text-white/80" />
                <h3 className="text-lg font-bold mb-2">Need help?</h3>
                <p className="text-sm text-white/80 mb-4 leading-relaxed">TripC AI can assist with changing complex settings or finding data.</p>
                <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl font-bold hover:bg-white/30 transition-colors text-sm">
                    Ask AI Assistant
                </button>
            </motion.div>

            {/* Status Summary */}
            <motion.div variants={fadeInUp} className="bg-white dark:bg-white/5 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Security Status
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Score</span>
                        <span className="font-bold text-green-600 dark:text-green-400">92/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-green-500 rounded-full" />
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-green-800 dark:text-green-300 font-medium">Your account is highly secure. 2FA is enabled.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
