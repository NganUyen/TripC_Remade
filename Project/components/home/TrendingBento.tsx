"use client"

import { motion } from 'framer-motion'
import { Star, ArrowUpRight } from 'lucide-react'
import { TRENDING } from './homeData'

export function TrendingBento() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Popular Right Now</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                {/* Large Feature Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2 relative rounded-[2.5rem] overflow-hidden group cursor-pointer h-[400px] lg:h-full shadow-lg"
                >
                    <img
                        src={TRENDING.feature.image}
                        alt={TRENDING.feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold border border-white/30">
                                <Star className="w-3 h-3 fill-white" />
                                {TRENDING.feature.rating}
                            </div>
                            <span className="text-orange-400 font-bold text-sm tracking-widest uppercase">Trending #1</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">{TRENDING.feature.title}</h3>
                        <p className="text-white/80 line-clamp-2 max-w-lg mb-6">{TRENDING.feature.description}</p>
                        <button className="self-start px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-[#FF5E1F] hover:text-white transition-colors flex items-center gap-2">
                            Explore Now
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Small Cards Column */}
                <div className="flex flex-col gap-6 h-full">
                    {TRENDING.small.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex-1 relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-md"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex justify-between items-end">
                                    <h4 className="text-white font-bold text-lg leading-tight w-2/3">{item.title}</h4>
                                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                        <Star className="w-3 h-3 fill-yellow-400" />
                                        {item.rating}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
