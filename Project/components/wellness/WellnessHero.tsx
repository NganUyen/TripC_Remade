"use client"

import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Leaf, Wind, Droplets, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

const categories = [
    { name: "Yoga", icon: <Leaf className="w-4 h-4" /> },
    { name: "Meditation", icon: <Wind className="w-4 h-4" /> },
    { name: "Thermal Baths", icon: <Droplets className="w-4 h-4" /> },
    { name: "Nature Walks", icon: <Sun className="w-4 h-4" /> },
    { name: "Retreats", icon: <Leaf className="w-4 h-4" /> },
]

export function WellnessHero() {
    return (
        <section className="relative min-h-[600px] w-full flex flex-col items-center justify-center p-4 pt-16 md:pt-24 pb-12">
            {/* Background & Mask */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2670&auto=format&fit=crop"
                    alt="Yoga and Meditation Retreat"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6"
                >
                    <Leaf className="w-4 h-4 text-green-300" />
                    <span className="text-sm font-medium tracking-wide">Wellness & Balance</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-md text-center"
                >
                    Find Your <span className="text-green-200 font-serif italic">Center</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-white/90 max-w-xl mx-auto font-medium text-center mb-10"
                >
                    Rejuvenate your mind, body, and soul with curated wellness experiences.
                </motion.p>

                {/* Floating Search Console */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-50 w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-[2rem] shadow-xl shadow-orange-500/5 mb-8"
                >
                    <SearchWidget />
                </motion.div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-3 overflow-x-auto pb-4 pt-8 no-scrollbar w-full px-2"
                >
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            className="flex items-center gap-2 whitespace-nowrap px-5 py-2.5 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm"
                        >
                            <span className="text-slate-900 dark:text-white">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

function SearchWidget() {
    const [activeTab, setActiveTab] = useState<'experience' | 'location' | 'dates' | null>(null)
    const [location, setLocation] = useState('')
    const [experienceType, setExperienceType] = useState('')

    // Date State
    const [dateRange, setDateRange] = useState({
        checkIn: 12,
        checkOut: 15,
        month: 'August',
        year: 2026
    })

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.search-widget-item')) {
                setActiveTab(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = () => {
        console.log('Searching wellness:', { location, experienceType, dateRange })
    }

    const handleDateSelect = (day: number) => {
        if (dateRange.checkIn && dateRange.checkOut) {
            setDateRange(prev => ({ ...prev, checkIn: day, checkOut: 0 }))
        } else if (dateRange.checkIn && !dateRange.checkOut) {
            if (day > dateRange.checkIn) {
                setDateRange(prev => ({ ...prev, checkOut: day }))
            } else {
                setDateRange(prev => ({ ...prev, checkIn: day, checkOut: 0 }))
            }
        } else {
            setDateRange(prev => ({ ...prev, checkIn: day }))
        }
    }

    return (
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700 relative">
            {/* Experience Type */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'experience' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('experience')}
            >
                <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 group-hover:scale-110 transition-transform">
                    <Leaf className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                    {activeTab === 'experience' ? (
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Yoga, Detox"
                            className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300 outline-none"
                            value={experienceType}
                            onChange={(e) => setExperienceType(e.target.value)}
                        />
                    ) : (
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">{experienceType || 'Any Experience'}</h3>
                    )}
                </div>

                {/* Experience Dropdown */}
                {activeTab === 'experience' && (
                    <div className="absolute top-full left-0 w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                        <p className="text-xs font-bold text-slate-400 px-4 py-2">POPULAR TYPES</p>
                        {['Yoga Retreat', 'Meditation', 'Detox Cleanse', 'Sound Healing', 'Forest Bathing', 'Spa Getaway'].map(type => (
                            <div
                                key={type}
                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between group/item"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setExperienceType(type)
                                    setActiveTab(null)
                                }}
                            >
                                <span>{type}</span>
                                <span className="opacity-0 group-hover/item:opacity-100 text-orange-500 text-xs">Select</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Location */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'location' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('location')}
            >
                <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                    {activeTab === 'location' ? (
                        <input
                            autoFocus
                            type="text"
                            placeholder="Where to?"
                            className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300 outline-none"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    ) : (
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">{location || 'Anywhere'}</h3>
                    )}
                </div>

                {/* Location Dropdown */}
                {activeTab === 'location' && (
                    <div className="absolute top-full left-0 w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                        <p className="text-xs font-bold text-slate-400 px-4 py-2">POPULAR DESTINATIONS</p>
                        {['Bali, Indonesia', 'Kyoto, Japan', 'Phuket, Thailand', 'Rishikesh, India', 'Sedona, USA', 'Ubud, Bali'].map(loc => (
                            <div
                                key={loc}
                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between group/item"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLocation(loc)
                                    setActiveTab(null)
                                }}
                            >
                                <span>{loc}</span>
                                <span className="opacity-0 group-hover/item:opacity-100 text-orange-500 text-xs">Select</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dates */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'dates' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('dates')}
            >
                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in — Check-out</p>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                        {dateRange.month} {dateRange.checkIn} - {dateRange.checkOut ? dateRange.checkOut : ''}
                    </h3>
                </div>

                {/* Date Picker Dropdown */}
                {activeTab === 'dates' && (
                    <div
                        className="absolute top-full left-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm">Select Dates</h4>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-slate-100 rounded-md"><svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                <span className="text-sm font-medium">{dateRange.month} {dateRange.year}</span>
                                <button className="p-1 hover:bg-slate-100 rounded-md"><svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 font-medium">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {[...Array(31)].map((_, i) => {
                                const day = i + 1;
                                const isStart = day === dateRange.checkIn;
                                const isEnd = day === dateRange.checkOut;
                                const isRange = dateRange.checkOut > 0 && day > dateRange.checkIn && day < dateRange.checkOut;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDateSelect(day)}
                                        className={`
                                            aspect-square flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                                            ${isRange ? 'bg-blue-50 text-blue-600 rounded-none' : ''}
                                            ${isStart ? 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600 rounded-full z-10' : ''}
                                            ${isEnd ? 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600 rounded-full z-10' : ''}
                                       `}
                                    >
                                        {day}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Button (Desktop) */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleSearch()
                }}
                className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 size-12 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-full items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 z-50"
            >
                <Search className="w-6 h-6" />
            </button>

            {/* Mobile Search Button */}
            <div className="lg:hidden p-2 pt-4">
                <button
                    onClick={handleSearch}
                    className="w-full py-4 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Search
                </button>
            </div>
        </div>
    )
}
