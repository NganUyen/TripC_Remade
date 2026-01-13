"use client"

import { motion } from 'framer-motion'
import { Smile, Zap, Coffee, Crosshair } from 'lucide-react'

const moods = [
    { name: "Relax", icon: <Smile className="w-6 h-6" />, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: "Energize", icon: <Zap className="w-6 h-6" />, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { name: "Detox", icon: <Coffee className="w-6 h-6" />, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { name: "Focus", icon: <Crosshair className="w-6 h-6" />, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
]

export function MoodFilters() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Browse by Mood</h2>

            <div className="flex flex-wrap justify-center gap-8">
                {moods.map((mood, index) => (
                    <motion.button
                        key={mood.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${mood.color} shadow-sm group-hover:shadow-md transition-all`}>
                            {mood.icon}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors">
                            {mood.name}
                        </span>
                    </motion.button>
                ))}
            </div>
        </section>
    )
}
