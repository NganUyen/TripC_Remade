"use client"

import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { FLASH_DEALS } from './homeData'

export function FlashDeals() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Glass Banner */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 dark:bg-white/5 p-8 md:p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Flash Sale</h2>
                        <p className="text-slate-300">Limited time offers ending soon</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-white font-mono font-bold text-lg tracking-widest">02:14:09</span>
                </div>
            </div>

            {/* Deals List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FLASH_DEALS.map((deal, index) => (
                    <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl hover:shadow-orange-500/5 transition-all group cursor-pointer"
                    >
                        <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4">
                            <img
                                src={deal.image}
                                alt={deal.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                {deal.discount}
                            </div>
                        </div>

                        <div className="px-2">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{deal.title}</h3>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {deal.tag}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 line-through">${deal.oldPrice}</span>
                                    <span className="text-xl font-bold text-[#FF5E1F]">${deal.price}</span>
                                </div>
                                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[#FF5E1F] group-hover:text-white transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
