"use client"

import { motion } from 'framer-motion'
import { Sparkles, MapPin } from 'lucide-react'
import { AI_CURATED } from './homeData'

export function AICurated() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Curated by TripC AI</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Personalized recommendations just for you</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Magic Insight Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:w-64 shrink-0 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-orange-500/5 flex flex-col justify-center gap-4 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-10 -mt-10" />

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white relative z-10">Why these picks?</h3>
                    <ul className="space-y-3 relative z-10">
                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                            Based on your recent search for "Wellness"
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                            Great weather in these regions right now
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                            High value flight deals available
                        </li>
                    </ul>
                </motion.div>

                {/* Horizontal Scroll Carousel */}
                <div className="flex-1 overflow-x-auto pb-8 -mb-8 flex gap-4 snap-x no-scrollbar mask-fade-right">
                    {AI_CURATED.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="snap-start shrink-0 w-64 h-80 relative rounded-[2rem] overflow-hidden group cursor-pointer"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                                <span className={`self-start px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2 ${item.color}`}>
                                    {item.reason}
                                </span>
                                <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                <div className="flex items-center gap-1 text-white/80 text-xs">
                                    <MapPin className="w-3 h-3" />
                                    {item.location}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
