"use client"

import { motion } from 'framer-motion'
import { Star, Wifi, Droplets, Utensils, Heart, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const hotels = [
    {
        id: 1,
        name: "InterContinental Danang Sun Peninsula Resort",
        location: "Son Tra Peninsula, Da Nang",
        rating: 9.2,
        ratingLabel: "Exceptional",
        reviews: 2450,
        stars: 5,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        priceOld: 650,
        priceNew: 485,
        badge: "Flash Sale",
        amenities: ["Free Wifi", "Private Pool", "Breakfast Included"]
    },
    {
        id: 2,
        name: "Hyatt Regency Danang Resort and Spa",
        location: "Non Nuoc Beach, Da Nang",
        rating: 8.8,
        ratingLabel: "Excellent",
        reviews: 1890,
        stars: 5,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
        priceOld: 320,
        priceNew: 245,
        badge: "Best Seller",
        amenities: ["Beachfront", "Spa", "Kids Club"]
    },
    {
        id: 3,
        name: "Naman Retreat",
        location: "Truong Sa Road, Da Nang",
        rating: 9.0,
        ratingLabel: "Superb",
        reviews: 1240,
        stars: 5,
        image: "https://images.unsplash.com/photo-1571896349842-68c47e90c885?q=80&w=2070&auto=format&fit=crop",
        priceOld: 450,
        priceNew: 315,
        badge: null,
        amenities: ["Private Villa", "Free Spa", "Yoga"]
    },
    {
        id: 4,
        name: "Sheraton Grand Danang Resort",
        location: "Hoa Hai Ward, Da Nang",
        rating: 8.9,
        ratingLabel: "Excellent",
        reviews: 980,
        stars: 5,
        image: "https://images.unsplash.com/photo-1615880480595-d500431d6c35?q=80&w=2074&auto=format&fit=crop",
        priceOld: 280,
        priceNew: 210,
        badge: "Member Deal",
        amenities: ["Infinity Pool", "Ocean View", "Gym"]
    }
]

export function HotelList() {
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    245 Properties Found <span className="text-slate-400 font-normal text-base ml-2">in Da Nang</span>
                </h2>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span>Sort by:</span>
                    <select className="bg-transparent border-none font-bold text-orange-500 focus:outline-none cursor-pointer">
                        <option>Recommended</option>
                        <option>Price: Low to High</option>
                        <option>Rating: High to Low</option>
                    </select>
                </div>
            </div>

            {hotels.map((hotel, index) => (
                <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-lg hover:shadow-xl hover:shadow-orange-500/5 transition-all w-full flex flex-col md:flex-row gap-4 md:h-[280px]"
                >
                    {/* Image Section (40%) */}
                    <div className="w-full md:w-[40%] h-56 md:h-full relative overflow-hidden rounded-[1.5rem]">
                        <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />

                        {hotel.badge && (
                            <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                {hotel.badge}
                            </div>
                        )}

                        <button className="absolute top-4 right-4 size-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Details Section (60%) */}
                    <div className="flex-1 flex flex-col justify-between py-2 pr-2 md:py-4 md:pr-4">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(hotel.stars)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                                        {hotel.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {hotel.location} • <span className="text-blue-500 hover:underline cursor-pointer">Show on Map</span>
                                    </p>
                                </div>
                                <div className="hidden md:flex flex-col items-end">
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 pr-3">
                                        <div className="bg-blue-600 text-white text-sm font-bold p-1.5 rounded-md min-w-[2.5rem] text-center">
                                            {hotel.rating}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">{hotel.ratingLabel}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">{hotel.reviews} reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {hotel.amenities.map((amenity, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {i === 0 ? <Wifi className="w-3.5 h-3.5 text-slate-400" /> :
                                            i === 1 ? <Droplets className="w-3.5 h-3.5 text-slate-400" /> :
                                                <Utensils className="w-3.5 h-3.5 text-slate-400" />}
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end justify-between mt-6 md:mt-0">
                            <div className="md:hidden flex items-center gap-2">
                                <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                    {hotel.rating}
                                </div>
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{hotel.ratingLabel}</span>
                            </div>

                            <div className="flex flex-col items-end ml-auto">
                                <span className="text-sm text-slate-400 line-through font-medium leading-none mb-1">US${hotel.priceOld}</span>
                                <div className="flex items-center gap-1 mb-3">
                                    <span className="text-xs text-slate-500 font-medium">from</span>
                                    <span className="text-3xl font-black text-orange-500">US${hotel.priceNew}</span>
                                    <span className="text-xs text-slate-500 font-medium">/night</span>
                                </div>
                                <Link
                                    href={`/hotels/${hotel.id}`}
                                    className="px-6 py-2.5 rounded-full bg-white dark:bg-transparent border-2 border-orange-500 text-orange-500 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 group/btn"
                                >
                                    View Deal
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            <button className="w-full py-4 text-center text-slate-500 dark:text-slate-400 font-semibold hover:text-orange-500 transition-colors">
                Show more results...
            </button>
        </div>
    )
}
