"use client"

import { motion } from 'framer-motion'
import { CATEGORIES } from './homeData'

export function CategoryGrid() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Explore by Category</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {CATEGORIES.map((cat, index) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                    >
                        <div className={`w-20 h-20 rounded-[1.5rem] ${cat.color} flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300`}>
                            <cat.icon className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                            {cat.name}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
