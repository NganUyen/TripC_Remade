"use client"

import { useState } from 'react'
import { WishlistHero } from '@/components/wishlist/WishlistHero'
import { EmptyState } from '@/components/wishlist/EmptyState'
import { TrendingCollections } from '@/components/wishlist/TrendingCollections'
import { Footer } from '@/components/Footer'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { WishlistButton } from '@/components/WishlistButton'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/currency'
import Link from 'next/link'

export default function WishlistPage() {
    const { wishlist, isLoading } = useWishlist()
    const [activeTab, setActiveTab] = useState('all')

    const filteredWishlist = activeTab === 'all'
        ? wishlist
        : wishlist.filter(item => {
            const type = item.item_type.toLowerCase();
            if (activeTab === 'stays') return type === 'hotel';
            if (activeTab === 'dining') return type === 'dining';
            if (activeTab === 'events') return type === 'events' || type === 'event';
            if (activeTab === 'activities') return type === 'activities' || type === 'activity';
            if (activeTab === 'wellness') return type === 'wellness';
            if (activeTab === 'beauty') return type === 'beauty';
            if (activeTab === 'shop') return type === 'shop' || type === 'product';
            return true;
        })

    const isEmpty = filteredWishlist.length === 0;

    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <WishlistHero activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-slate-50 dark:bg-zinc-900 rounded-[2rem] aspect-[4/5] animate-pulse overflow-hidden border border-slate-100 dark:border-zinc-800">
                                <div className="h-2/3 bg-slate-200 dark:bg-zinc-800" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-6 w-1/4 bg-slate-200 dark:bg-zinc-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isEmpty ? (
                    <EmptyState activeTab={activeTab} />
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence mode="sync">
                            {filteredWishlist.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: Math.min(index * 0.05, 0.5),
                                        ease: "easeOut"
                                    }}
                                    className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={item.image_url || "/images/placeholder.jpg"}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div
                                            className="absolute top-4 right-4 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <WishlistButton
                                                itemId={item.item_id}
                                                itemType={item.item_type}
                                                title={item.title}
                                                imageUrl={item.image_url || undefined}
                                                price={item.price || undefined}
                                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border hover:bg-white"
                                            />
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-slate-900/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {item.item_type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#FF5E1F] transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.price && (
                                            <p className="text-[#FF5E1F] font-black text-xl">
                                                {formatCurrency(item.price, 'USD')}
                                            </p>
                                        )}
                                        <Link
                                            href={item.item_type === 'hotel'
                                                ? `/hotels/${item.item_id}`
                                                : item.item_type === 'dining'
                                                    ? `/dining/${item.item_id}`
                                                    : `/${item.item_type}/${item.item_id}`}
                                            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#FF5E1F] hover:text-white text-slate-900 dark:text-white rounded-full text-xs font-bold transition-all flex items-center justify-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Suggested Collections */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-12">
                <TrendingCollections />
            </div>

            <Footer />
        </main>
    )
}
