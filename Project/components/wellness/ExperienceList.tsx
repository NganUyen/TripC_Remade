"use client"

import { motion } from 'framer-motion'
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { WellnessExperience } from '@/types'
import { WishlistButton } from '@/components/WishlistButton'
import { toast } from 'sonner'

interface ExperienceListProps {
    experiences: WellnessExperience[]
}

export function ExperienceList({ experiences }: ExperienceListProps) {
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {experiences.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative rounded-xl md:rounded-[2rem] overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                        {/* Image */}
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            {item.badge && (
                                <span className="bg-[#EAF5E9] text-[#1D5E2C] dark:bg-[#1D5E2C]/80 dark:text-white backdrop-blur-sm text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                                    {item.badge}
                                </span>
                            )}
                        </div>

                        <div
                            className="absolute top-4 right-4 z-10"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <WishlistButton
                                itemId={item.id}
                                itemType="wellness"
                                title={item.title}
                                imageUrl={item.image_url}
                                price={item.price}
                                className="bg-white/20 backdrop-blur-md border-transparent hover:bg-white text-white"
                            />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <h3 className="text-sm md:text-xl font-bold text-white mb-0.5 md:mb-1 leading-tight group-hover:text-green-200 transition-colors line-clamp-2">{item.title}</h3>

                            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 text-white/90">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="text-xs md:text-sm font-medium truncate">{item.location}</span>
                            </div>

                            <div className="flex items-center justify-between mb-2 md:mb-4">
                                <div className="flex items-center gap-1 md:gap-1.5">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 font-bold text-xs md:text-sm">{item.rating}</span>
                                    <span className="text-white/60 text-[10px] md:text-xs">({item.reviews_count})</span>
                                </div>
                                <span className="text-[10px] md:text-xs text-white/70 bg-white/20 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md backdrop-blur-sm">{item.duration}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-white/10">
                                <span className="text-lg md:text-2xl font-bold text-[#FF5E1F] drop-shadow-sm">
                                    ${item.price}
                                </span>

                                <Link href={`/wellness/${item.id}`} className="block">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toast.info("Wellness booking coming soon!")
                                        }}
                                        className="bg-[#FF5E1F] text-white px-2 py-1 md:px-6 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold opacity-100 translate-y-0 md:opacity-0 md:translate-y-8 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:bg-orange-600 block">
                                        Book
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

