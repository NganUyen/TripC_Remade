"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SearchBar } from '@/components/shop/SearchBar'
import Link from 'next/link'

export function ShopHero() {
    const [activeTab, setActiveTab] = useState<'products' | 'giftcards'>('products')
    const categories = [
        { name: 'Luggage', slug: 'luggage' },
        { name: 'Tech', slug: 'tech' },
        { name: 'Wearables', slug: 'wearables' },
        { name: 'Toiletries', slug: 'toiletries' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Sleep', slug: 'sleep' },
        { name: 'Photography', slug: 'photography' },
        { name: 'Outdoors', slug: 'outdoors' }
    ]

    return (
        <section className="relative w-full min-h-[480px] md:min-h-[520px] flex flex-col items-center justify-start pt-14 pb-8 px-4">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1556905200-279565513a2d?q=80&w=2670&auto=format&fit=crop"
                    alt="Travel Gear"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 via-70% to-[#fcfaf8] dark:to-[#0a0a0a]" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-4xl md:text-5xl font-bold mb-6 text-center drop-shadow-lg"
                >
                    Pack smarter,<br />travel further.
                </motion.h1>

                {/* Search Bar */}
                <div className="w-full mb-6">
                    <SearchBar />
                </div>

                {/* Segmented Control */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-zinc-800 p-1 rounded-full shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'products'
                                ? 'bg-slate-900 dark:bg-[#FF5E1F] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('giftcards')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'giftcards'
                                ? 'bg-slate-900 dark:bg-[#FF5E1F] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Gift Cards
                        </button>
                    </div>
                </div>

                {/* Quick Category Pills - Slider */}
                <div className="w-full overflow-hidden">
                    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x px-4 no-scrollbar mask-gradient-x justify-start md:justify-center">
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/shop/search?category=${cat.slug}`}
                                className="snap-start shrink-0 whitespace-nowrap px-6 py-3 
                                    bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md 
                                    border border-white/20 dark:border-white/10 
                                    rounded-full 
                                    text-slate-900 dark:text-white 
                                    text-sm font-bold tracking-wide
                                    hover:bg-white dark:hover:bg-zinc-800 hover:scale-105 hover:shadow-lg
                                    transition-all duration-300 ease-out"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
