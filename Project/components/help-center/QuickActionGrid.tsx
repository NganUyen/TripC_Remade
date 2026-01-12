"use client"

import { motion } from 'framer-motion'
import { QUICK_ACTIONS } from './shared'

export function QuickActionGrid() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {QUICK_ACTIONS.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 border border-slate-100 dark:border-slate-800"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-4 transition-colors`}>
                            <action.icon className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm whitespace-nowrap">
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </section>
    )
}
