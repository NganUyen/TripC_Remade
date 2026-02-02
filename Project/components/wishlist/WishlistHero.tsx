"use client"

import { motion } from 'framer-motion'
import { Map, Calendar, Heart, Utensils } from 'lucide-react'
import { useState } from 'react'

const TABS = [
    { id: 'all', label: 'All', icon: Map },
    { id: 'stays', label: 'Stays', icon: Calendar },
    { id: 'dining', label: 'Dining', icon: Utensils },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'activities', label: 'Activities', icon: Map },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'beauty', label: 'Beauty', icon: Heart },
    { id: 'shop', label: 'Shop', icon: Utensils },
]

interface WishlistHeroProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function WishlistHero({ activeTab, onTabChange }: WishlistHeroProps) {

    return (
        <section className="pt-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

                {/* Text Content */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
                    >
                        My Wishlist
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium"
                    >
                        Your saved collections and travel plans.
                    </motion.p>
                </div>

                {/* Compact Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}
