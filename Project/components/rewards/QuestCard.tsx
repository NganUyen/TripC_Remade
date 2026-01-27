"use client"

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { fadeInUp } from './shared'

export function QuestCard() {
    return (
        <motion.div
            variants={fadeInUp}
            className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu mb-8"
        >
            <div className="relative h-full bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Active Quests</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">2 quests available today</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-[#fcfaf8] dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Claim Rewards
                </button>
            </div>
        </motion.div>
    )
}
