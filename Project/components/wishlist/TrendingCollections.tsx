"use client"

import { motion } from 'framer-motion'
import { Star, MapPin, Heart } from 'lucide-react'

const SUGGESTIONS = [
    {
        id: 1,
        title: "Santorini Sunset Villas",
        location: "Oia, Greece",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Kyoto Ryokan Retreat",
        location: "Kyoto, Japan",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=2787&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Amalfi Coast Escape",
        location: "Positano, Italy",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2787&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Bali Jungle Treehouse",
        location: "Ubud, Indonesia",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?q=80&w=2880&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Parisien Luxury Apartment",
        location: "Paris, France",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2973&auto=format&fit=crop"
    }
]

export function TrendingCollections() {
    return (
        <section className="py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="max-w-[1440px] mx-auto">
                <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Curated Inspirations</h3>
                        <p className="text-slate-500 dark:text-slate-400">Handpicked destinations to add to your board.</p>
                    </div>
                    <button className="text-sm font-bold text-[#FF5E1F] hover:text-orange-600 transition-colors">See All</button>
                </div>

                {/* Horizontal Snap Scroll */}
                <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 px-4 sm:px-6 lg:px-8 no-scrollbar">
                    {SUGGESTIONS.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative min-w-[280px] h-[400px] rounded-[2rem] overflow-hidden group cursor-pointer snap-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Heart Button */}
                            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all hover:scale-110 active:scale-95">
                                <Heart className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="px-2 py-1 rounded-md bg-[#FF5E1F] text-white text-xs font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" />
                                        {item.rating}
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-1 leading-tight">{item.title}</h4>
                                <div className="flex items-center gap-1 text-white/80">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.location}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
