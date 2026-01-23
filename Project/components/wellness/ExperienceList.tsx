"use client"

import { motion } from 'framer-motion'
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { wellnessExperiences } from '@/data/wellness'

export function ExperienceList() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Experiences</h2>
                    <p className="text-slate-500 text-sm mt-1">Curated for your wellbeing</p>
                </div>
                <Link href="#" className="text-orange-500 font-bold text-sm hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wellnessExperiences.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                        {/* Image */}
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            {item.badge && (
                                <span className="bg-[#EAF5E9] text-[#1D5E2C] dark:bg-[#1D5E2C]/80 dark:text-white backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                                    {item.badge}
                                </span>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 z-10">
                            <button className="size-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <h3 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-green-200 transition-colors">{item.title}</h3>

                            <div className="flex items-center gap-2 mb-2 text-white/90">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.location}</span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 font-bold text-sm">{item.rating}</span>
                                    <span className="text-white/60 text-xs">({item.reviews})</span>
                                </div>
                                <span className="text-xs text-white/70 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">{item.duration}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-2xl font-bold text-[#FF5E1F] drop-shadow-sm">
                                    ${item.price}
                                </span>

                                <Link href={`/wellness/${item.id}`}>
                                    <button className="bg-[#FF5E1F] text-white px-6 py-2.5 rounded-full text-sm font-bold opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:bg-orange-600">
                                        Book Now
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
