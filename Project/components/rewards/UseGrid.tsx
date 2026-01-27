"use client"

import { motion } from 'framer-motion'
import { USE_CASES, fadeInUp } from './shared'

export function UseGrid() {
    return (
        <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 px-2">How you use Tcent</h2>
            <div className="grid grid-cols-2 gap-4">
                {USE_CASES.map((use) => (
                    <motion.button
                        key={use.id}
                        variants={fadeInUp}
                        className="bg-white dark:bg-white/5 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 text-left hover:-translate-y-1 transition-transform group"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${use.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <use.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{use.title}</h3>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
