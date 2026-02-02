"use client"

import { motion } from 'framer-motion'
import { Star, MapPin } from 'lucide-react'
import { WishlistButton } from '@/components/WishlistButton'
import Link from 'next/link'

const SUGGESTIONS = [
    {
        id: "59dc1862-784e-4c2e-992b-b81b13e95ea0",
        title: "Nhà Hàng Phố Cổ",
        location: "Hà Nội, Vietnam",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        type: "dining"
    },
    {
        id: "2374916b-fba0-46a7-87c5-f70105a9ec4e",
        title: "Four Seasons Resort The Nam Hai",
        location: "Hoi An, Vietnam",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        type: "hotel"
    },
    {
        id: "2ce9dd94-8ca7-45fa-8e85-3683b0242c8c",
        title: "Sky Lounge & Dining",
        location: "Hà Nội, Vietnam",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
        type: "dining"
    },
    {
        id: "36870849-9d0f-4936-a1cb-4c65cc76b5b2",
        title: "JW Marriott Phu Quoc Emerald Bay",
        location: "Phu Quoc, Vietnam",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        type: "hotel"
    },
    {
        id: "f065d4f9-7bf3-46a7-a375-bdcb9f125539",
        title: "InterContinental Phu Quoc Resort",
        location: "Phu Quoc, Vietnam",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        type: "hotel"
    }
]

interface TrendingCollectionsProps {
    wishlistIds?: string[]
}

export function TrendingCollections({ wishlistIds = [] }: TrendingCollectionsProps) {
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
                            <Link href={`/${item.type === 'hotel' ? 'hotels' : 'dining'}/${item.id}`} className="block w-full h-full">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </Link>

                            {/* Wishlist Button */}
                            <div className="absolute top-4 right-4 z-10">
                                <WishlistButton
                                    itemId={String(item.id)}
                                    itemType={item.type}
                                    title={item.title}
                                    imageUrl={item.image}
                                    initialInWishlist={wishlistIds.includes(String(item.id))}
                                    className="bg-white/10 backdrop-blur-md border-transparent text-white hover:bg-white"
                                />
                            </div>

                            {/* Content */}
                            <Link href={`/${item.type === 'hotel' ? 'hotels' : 'dining'}/${item.id}`} className="absolute bottom-0 left-0 right-0 p-6 z-0">
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
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
