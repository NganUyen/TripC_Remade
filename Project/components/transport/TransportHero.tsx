"use client"

import { useState, useRef, useEffect } from 'react'

export function TransportHero() {
    const [serviceType, setServiceType] = useState('one-way') // 'one-way' | 'hourly'
    const [bookingMode, setBookingMode] = useState('address') // 'address' | 'map'
    const [duration, setDuration] = useState('4h')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    // Passengers & Luggage State
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, luggage: 2 })
    const [showPopover, setShowPopover] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    // Locations
    const [pickup, setPickup] = useState('JFK International Airport')
    const [dropoff, setDropoff] = useState('Manhattan, NY')

    // Click outside listener
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowPopover(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const updatePassengers = (type: keyof typeof passengers, operation: 'add' | 'sub') => {
        setPassengers(prev => {
            const newValue = operation === 'add' ? prev[type] + 1 : prev[type] - 1
            if (newValue < 0) return prev
            // Basic adult validation
            if (type === 'adults' && newValue < 1) return prev
            return { ...prev, [type]: newValue }
        })
    }

    const totalPassengers = passengers.adults + passengers.children

    const handleSwap = () => {
        const temp = pickup
        setPickup(dropoff)
        setDropoff(temp)
    }

    return (
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center px-4 py-12 lg:px-0">
            {/* Background - City Nightscape */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2864&auto=format&fit=crop')" }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 lg:px-12 flex flex-col items-center">

                {/* Hero Headings */}
                <div className="text-center mb-10 max-w-4xl animate-fadeIn">
                    <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-2xl">
                        Premium Chauffeur Services
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-medium drop-shadow-md max-w-2xl mx-auto tracking-wide">
                        Arrive in style. Reliable airport transfers and hourly charters.
                    </p>
                </div>

                {/* Search Panel */}
                <div className="w-full max-w-[1100px] relative">
                    <div className="rounded-[2rem] p-6 md:p-8 shadow-2xl bg-white/80 dark:bg-[#18181b]/90 backdrop-blur-xl border border-white/20 relative z-20 pb-16 transition-colors duration-300">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-black/5 dark:border-white/10 pb-0">
                            {/* Tabs */}
                            <div className="flex gap-6 w-fit">
                                {[
                                    { id: 'one-way', label: 'One Way Transfer' },
                                    { id: 'hourly', label: 'Hourly Charter' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setServiceType(tab.id)}
                                        className={`relative pb-3 text-sm font-bold tracking-wide transition-all ${serviceType === tab.id ? 'text-primary' : 'text-slate-600 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                                    >
                                        {tab.label.toUpperCase()}
                                        <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full transition-transform duration-300 ${serviceType === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span>
                                    </button>
                                ))}
                            </div>

                            {/* Address/Map Toggle (Only visible in One-Way) */}
                            {serviceType === 'one-way' && (
                                <div className="flex bg-slate-100 dark:bg-white/10 rounded-full p-1 mb-2">
                                    <button
                                        onClick={() => setBookingMode('address')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bookingMode === 'address' ? 'bg-white dark:bg-[#18181b] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        Enter Address
                                    </button>
                                    <button
                                        onClick={() => setBookingMode('map')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bookingMode === 'map' ? 'bg-white dark:bg-[#18181b] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        Pin on Map
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Grid */}
                        <div className="flex flex-col gap-4">
                            {/* Row 1: Locations */}
                            {bookingMode === 'map' && serviceType === 'one-way' ? (
                                <div className="h-[64px] bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-white/40 font-bold animate-fadeIn">
                                    <span className="material-symbols-outlined">map</span>
                                    Interactive Map Selection Coming Soon
                                </div>
                            ) : (
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 relative items-center animate-fadeIn">

                                    {/* PICKUP (5 Cols) */}
                                    <div className="w-full md:col-span-5 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Pickup Location</label>
                                        <input
                                            type="text"
                                            value={pickup}
                                            onChange={(e) => setPickup(e.target.value)}
                                            className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full truncate placeholder-slate-400 dark:placeholder-white/30"
                                            placeholder="Enter pickup address"
                                        />
                                    </div>

                                    {/* SWAP / SEPARATOR */}
                                    <div className="md:col-span-2 relative flex justify-center z-30 my-[-18px] md:my-0">
                                        {serviceType === 'one-way' ? (
                                            <button
                                                onClick={handleSwap}
                                                className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white/80 hover:text-primary hover:border-primary shadow-lg transition-all md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rotate-90 md:rotate-0"
                                            >
                                                <span className="material-symbols-outlined text-xl">sync_alt</span>
                                            </button>
                                        ) : (
                                            <div className="hidden md:block w-px h-10 bg-black/10 dark:bg-white/10 mx-auto"></div>
                                        )}
                                    </div>

                                    {/* DROPOFF or DURATION (5 Cols) */}
                                    <div className="w-full md:col-span-5 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group relative">
                                        {serviceType === 'one-way' ? (
                                            <>
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Dropoff Location</label>
                                                <input
                                                    type="text"
                                                    value={dropoff}
                                                    onChange={(e) => setDropoff(e.target.value)}
                                                    className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full truncate placeholder-slate-400 dark:placeholder-white/30"
                                                    placeholder="Enter destination"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Duration</label>
                                                <select
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full cursor-pointer appearance-none"
                                                >
                                                    <option value="4h">4 Hours</option>
                                                    <option value="6h">6 Hours</option>
                                                    <option value="8h">8 Hours</option>
                                                    <option value="12h">12 Hours</option>
                                                    <option value="24h">Full Day</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-white/40 pointer-events-none">expand_more</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Row 2: Date - Time - Passengers */}
                            <div className="flex flex-col md:grid md:grid-cols-12 gap-3">

                                {/* DATE (4 Cols) */}
                                <div
                                    className="w-full md:col-span-4 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group"
                                    onClick={(e) => e.currentTarget.querySelector('input')?.showPicker()}
                                >
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Date</label>
                                    <div className={`font-bold text-lg ${date ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                        {date || 'Select Date'}
                                    </div>
                                    <input
                                        type="date"
                                        className="absolute inset-0 opacity-0 pointer-events-none"
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>

                                {/* TIME (4 Cols) */}
                                <div
                                    className="w-full md:col-span-4 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group"
                                    onClick={(e) => e.currentTarget.querySelector('input')?.showPicker()}
                                >
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Pickup Time</label>
                                    <div className={`font-bold text-lg ${time ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                        {time || 'Select Time'}
                                    </div>
                                    <input
                                        type="time"
                                        className="absolute inset-0 opacity-0 pointer-events-none"
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>

                                {/* PASSENGERS & LUGGAGE (4 Cols) */}
                                <div className="w-full md:col-span-4 relative" ref={popoverRef}>
                                    <div
                                        className="h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer"
                                        onClick={() => setShowPopover(!showPopover)}
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Passengers & Bags</label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-lg text-slate-900 dark:text-white">person</span>
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{totalPassengers}</span>
                                            </div>
                                            <div className="w-px h-4 bg-slate-300 dark:bg-white/20"></div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-lg text-slate-900 dark:text-white">business_center</span>
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{passengers.luggage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* POPOVER */}
                                    {showPopover && (
                                        <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-5 z-50 animate-fadeIn">
                                            <div className="flex flex-col gap-4">
                                                {/* Adults */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-slate-900 dark:text-white font-bold text-sm">Adults</div>
                                                        <div className="text-slate-500 dark:text-white/40 text-xs">Age 13+</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => updatePassengers('adults', 'sub')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">-</button>
                                                        <span className="text-slate-900 dark:text-white font-bold w-4 text-center">{passengers.adults}</span>
                                                        <button onClick={() => updatePassengers('adults', 'add')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">+</button>
                                                    </div>
                                                </div>

                                                {/* Children */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-slate-900 dark:text-white font-bold text-sm">Children</div>
                                                        <div className="text-slate-500 dark:text-white/40 text-xs">Age 2-12</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => updatePassengers('children', 'sub')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">-</button>
                                                        <span className="text-slate-900 dark:text-white font-bold w-4 text-center">{passengers.children}</span>
                                                        <button onClick={() => updatePassengers('children', 'add')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">+</button>
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-slate-100 dark:bg-white/10 my-1"></div>

                                                {/* Luggage */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-slate-600 dark:text-white">business_center</span>
                                                        <div>
                                                            <div className="text-slate-900 dark:text-white font-bold text-sm">Luggage</div>
                                                            <div className="text-slate-500 dark:text-white/40 text-xs">Standard Bags</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => updatePassengers('luggage', 'sub')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">-</button>
                                                        <span className="text-slate-900 dark:text-white font-bold w-4 text-center">{passengers.luggage}</span>
                                                        <button onClick={() => updatePassengers('luggage', 'add')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5">+</button>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-1">
                                                    <button
                                                        onClick={() => setShowPopover(false)}
                                                        className="w-full py-2 bg-primary hover:bg-primary-hover rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-40 w-full max-w-sm px-4">
                            <button className="w-full relative py-4 bg-gradient-to-r from-primary to-[#FF8C42] rounded-full shadow-[0_15px_30px_-5px_rgba(255,94,31,0.5)] transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden text-white font-black text-lg tracking-wide uppercase">
                                <span className="material-symbols-outlined text-2xl">directions_car</span>
                                {bookingMode === 'map' ? 'Select Location' : 'Search Vehicles'}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
