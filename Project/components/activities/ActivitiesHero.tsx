"use client"

import React, { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ActivitiesHeroProps {
    allActivities: Activity[]
}

const CATEGORIES = [
    "All",
    "Tours",
    "Water Sports",
    "Outdoor",
    "Culture",
    "Workshops"
]

export function ActivitiesHero({ allActivities }: ActivitiesHeroProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get('category') || 'All'

    const [searchQuery, setSearchQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/activities?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleCategoryClick = (category: string) => {
        if (category === 'All') {
            router.push('/activities')
        } else {
            router.push(`/activities?category=${encodeURIComponent(category)}`)
        }
    }

    const filteredActivities = searchQuery.length > 1
        ? allActivities.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.location?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : []

    return (
        <div className="relative w-full h-[450px] flex items-center justify-center overflow-visible z-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop"
                    alt="Activities Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-xl tracking-tight"
                >
                    <span className="text-[#FF5E1F]">Activities</span> & Tours
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium drop-shadow-md"
                >
                    Discover and book unforgettable experiences for your next adventure
                </motion.p>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl relative mb-8"
                >
                    <form onSubmit={handleSearch} className="relative group">
                        <div className={cn(
                            "flex items-center bg-white dark:bg-slate-900 shadow-2xl rounded-full p-2 pl-6 transition-all duration-300 border border-slate-100 dark:border-slate-800",
                            isFocused ? "ring-4 ring-[#FF5E1F]/20 scale-[1.02]" : "hover:scale-[1.01]"
                        )}>
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search activities, locations..."
                                className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            />
                            <button
                                type="submit"
                                className="bg-[#FF5E1F] hover:bg-[#FF5E1F]/90 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#FF5E1F]/20 active:scale-95"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {isFocused && filteredActivities.length > 0 && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="py-2">
                                <span className="block px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Suggested Activities
                                </span>
                                {filteredActivities.map((activity) => (
                                    <button
                                        key={activity.id}
                                        className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors text-left border-b border-slate-50 dark:border-slate-800/50 last:border-none"
                                        onClick={() => router.push(`/activities/${activity.id}`)}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                            <img src={activity.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{activity.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {activity.location || "Unknown Location"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Category Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-2"
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = currentCategory === cat
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all duration-300 border",
                                    isActive
                                        ? "bg-[#FF5E1F] text-white border-[#FF5E1F] shadow-lg shadow-[#FF5E1F]/20"
                                        : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                                )}
                            >
                                {cat}
                            </button>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}
