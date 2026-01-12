"use client"

import { motion } from 'framer-motion'
import { Check, Gift } from 'lucide-react'
import { EARN_TASKS, fadeInUp } from './shared'

export function EarnList() {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">How you earn Tcent</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Caps Apply</span>
                    <div className="w-8 h-4 bg-slate-200 dark:bg-white/10 rounded-full relative">
                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                {EARN_TASKS.map((task, i) => (
                    <motion.div
                        key={task.id}
                        variants={fadeInUp}
                        className={`p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i !== EARN_TASKS.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.state === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                    task.state === 'active' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                        'bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                                }`}>
                                {task.state === 'completed' ? <Check className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{task.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">+{task.reward}</span>
                            {task.state === 'active' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                            {task.state === 'new' && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
