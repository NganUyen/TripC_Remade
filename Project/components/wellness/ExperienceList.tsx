"use client"

import { motion } from 'framer-motion'
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const experiences = [
    {
        id: 1,
        title: "Bali Silence Retreat",
        location: "Ubud, Indonesia",
        rating: 4.9,
        reviews: 420,
        price: 850,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop",
        badge: "Instant Confirmation",
        duration: "7 Days"
    },
    {
        id: 2,
        title: "Urban Float Tank Experience",
        location: "Singapore",
        rating: 4.8,
        reviews: 156,
        price: 95,
        image: "https://images.unsplash.com/photo-1596131397999-dbdcbdd0e8fb?q=80&w=1968&auto=format&fit=crop",
        badge: "Best Value",
        duration: "90 Mins"
    },
    {
        id: 3,
        title: "Forest Bathing & Meditation",
        location: "Kyoto, Japan",
        rating: 5.0,
        reviews: 89,
        price: 120,
        image: "https://images.unsplash.com/photo-1505322101000-19457c432243?q=80&w=1928&auto=format&fit=crop",
        badge: null,
        duration: "4 Hours"
    },
    {
        id: 4,
        title: "Himalayan Sound Healing",
        location: "Pokhara, Nepal",
        rating: 4.9,
        reviews: 310,
        price: 450,
        image: "https://images.unsplash.com/photo-1590159763784-5f15c7213824?q=80&w=1974&auto=format&fit=crop",
        badge: "Top Rated",
        duration: "3 Days"
    }
]

export function ExperienceList() {
    return (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
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
                {experiences.map((item, index) => (
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

                                <button className="bg-[#FF5E1F] text-white px-6 py-2.5 rounded-full text-sm font-bold opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:bg-orange-600">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
