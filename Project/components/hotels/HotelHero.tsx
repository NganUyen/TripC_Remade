"use client"

import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export function HotelHero() {
    return (
        <section className="relative w-full pb-24">
            {/* Background & Mask */}
            <div className="absolute inset-0 h-[500px] w-full z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Resort Pool"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-40 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40">
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-sm">
                            Find Your <span className="text-orange-500">Escape</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-sm">
                            Discover exquisite stays and exclusive deals for your next getaway.
                        </p>
                    </motion.div>

                    {/* Floating Search Console */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative z-50 w-full max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-[2rem] shadow-xl shadow-orange-500/5 mb-8"
                    >
                        <SearchWidget />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function SearchWidget() {
    const [activeTab, setActiveTab] = useState<'destination' | 'dates' | 'guests' | null>(null)
    const [destination, setDestination] = useState('')

    // Guest State
    const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 })

    // Date State (Mock default dates for now, but selectable)
    const [dateRange, setDateRange] = useState({
        checkIn: 12,
        checkOut: 15,
        month: 'May',
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
        console.log('Searching for:', { destination, guests, dateRange })
        alert(`Searching hotels in ${destination || '...'} for ${guests.adults} adults, ${guests.children} children...`)
    }

    const updateGuests = (type: 'adults' | 'children' | 'rooms', operation: 'inc' | 'dec') => {
        setGuests(prev => {
            const newValue = operation === 'inc' ? prev[type] + 1 : prev[type] - 1
            if (newValue < 0) return prev // prevent negative
            if (type === 'adults' && newValue < 1) return prev // at least 1 adult
            if (type === 'rooms' && newValue < 1) return prev // at least 1 room
            return { ...prev, [type]: newValue }
        })
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
            {/* Destination */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'destination' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('destination')}
            >
                <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                    {activeTab === 'destination' ? (
                        <input
                            autoFocus
                            type="text"
                            placeholder="Where are you going?"
                            className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300 outline-none"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    ) : (
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">{destination || 'Where are you going?'}</h3>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate text-left">Popular coastal city</p>
                </div>

                {/* Dropdown */}
                {activeTab === 'destination' && (
                    <div className="absolute top-full left-0 w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                        <p className="text-xs font-bold text-slate-400 px-4 py-2">POPULAR DESTINATIONS</p>
                        {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Vũng Tàu', 'Phú Quốc', 'Hội An'].map(city => (
                            <div
                                key={city}
                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between group/item"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDestination(city)
                                    setActiveTab(null)
                                }}
                            >
                                <span>{city}</span>
                                <span className="opacity-0 group-hover/item:opacity-100 text-orange-500 text-xs">Select</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dates */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'dates' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('dates')}
            >
                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in — Check-out</p>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                        {dateRange.month} {dateRange.checkIn} - {dateRange.checkOut ? dateRange.checkOut : '...'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
                        {dateRange.checkOut ? `${dateRange.checkOut - dateRange.checkIn} nights` : 'Select check-out'} • Weekend
                    </p>
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

            {/* Guests */}
            <div
                className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === 'guests' ? 'bg-white shadow-lg z-30' : 'z-20'}`}
                onClick={() => setActiveTab('guests')}
            >
                <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                        {guests.adults} Adults, {guests.rooms} Room
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
                        {guests.children > 0 ? `+ ${guests.children} Children` : 'Standard Room'}
                    </p>
                </div>

                {/* Guests Dropdown */}
                {activeTab === 'guests' && (
                    <div
                        className="absolute top-full left-0 w-[280px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Adults */}
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Adults</p>
                                <p className="text-xs text-slate-500">Ages 13+</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('adults', 'dec')}>-</button>
                                <span className="font-bold w-4 text-center">{guests.adults}</span>
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('adults', 'inc')}>+</button>
                            </div>
                        </div>
                        {/* Children */}
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Children</p>
                                <p className="text-xs text-slate-500">Ages 2-12</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('children', 'dec')}>-</button>
                                <span className="font-bold w-4 text-center">{guests.children}</span>
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('children', 'inc')}>+</button>
                            </div>
                        </div>
                        {/* Rooms */}
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Rooms</p>
                                <p className="text-xs text-slate-500">Max 4</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('rooms', 'dec')}>-</button>
                                <span className="font-bold w-4 text-center">{guests.rooms}</span>
                                <button className="size-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600" onClick={() => updateGuests('rooms', 'inc')}>+</button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleSearch()
                    }}
                    className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 size-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 z-50"
                >
                    <Search className="w-7 h-7" />
                </button>
            </div>

            {/* Mobile Search Button */}
            <div className="lg:hidden p-2 pt-4">
                <button
                    onClick={handleSearch}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Search Hotels
                </button>
            </div>
        </div>
    )
}
