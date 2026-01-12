"use client"

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { fadeInUp } from './shared'

export function QuestCard() {
    return (
        <motion.div variants={fadeInUp} className="bg-white dark:bg-white/5 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Active Quests</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">2 quests available today</p>
                </div>
            </div>
            <button className="px-4 py-2 bg-[#fcfaf8] dark:bg-white/10 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-colors">
                Claim Rewards
            </button>
        </motion.div>
    )
}
