"use client"

import { useState, useRef, useEffect } from 'react'

const AIRPORTS = [
    { code: 'HAN', city: 'Hanoi', country: 'Vietnam' },
    { code: 'SGN', city: 'Ho Chi Minh', country: 'Vietnam' },
    { code: 'DAD', city: 'Da Nang', country: 'Vietnam' },
    { code: 'JFK', city: 'New York', country: 'United States' },
    { code: 'LHR', city: 'London', country: 'United Kingdom' },
    { code: 'HND', city: 'Tokyo', country: 'Japan' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore' },
    { code: 'DXB', city: 'Dubai', country: 'UAE' },
]

export function FlightsHero() {
    const [tripType, setTripType] = useState('round-trip')
    const [from, setFrom] = useState(AIRPORTS[3]) // JFK default
    const [to, setTo] = useState(AIRPORTS[4]) // LHR default
    const [departDate, setDepartDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    // Travelers State
    const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0 })
    const [showTravelers, setShowTravelers] = useState(false)
    const travelersRef = useRef<HTMLDivElement>(null)

    // Multi-City State
    const [multiCityFlights, setMultiCityFlights] = useState([
        { id: 1, from: AIRPORTS[0], to: AIRPORTS[1], date: '' },
        { id: 2, from: AIRPORTS[1], to: AIRPORTS[2], date: '' }
    ])

    // Swap Animation State
    const [isSwapped, setIsSwapped] = useState(false)

    // Click outside handler for travelers popover
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (travelersRef.current && !travelersRef.current.contains(event.target as Node)) {
                setShowTravelers(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSwap = () => {
        setIsSwapped(!isSwapped)
        const temp = from
        setFrom(to)
        setTo(temp)
    }

    const updateTravelers = (type: keyof typeof travelers, operation: 'add' | 'sub') => {
        setTravelers(prev => {
            const newValue = operation === 'add' ? prev[type] + 1 : prev[type] - 1
            if (newValue < 0) return prev
            // Validation: Infants cannot exceed adults
            if (type === 'infants' && newValue > prev.adults) return prev
            // Validation: Minimum 1 adult
            if (type === 'adults' && newValue < 1) return prev
            return { ...prev, [type]: newValue }
        })
    }

    const totalTravelers = travelers.adults + travelers.children + travelers.infants

    return (
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center px-4 py-8 lg:px-0">
            {/* Background Image - Full Size with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSW5ptZcWxu-M07XsgjJgkGMtddb2TBJjvhRkOkTzQYWDC5ExzqFjvo6re-SXnq25ibzXANFSKxDGmNJYEZ1A0MUur144EyC5c1E1ZIjaJOcDmtZWSTLwmwhL5twIrPRYAvzILXrn8o4JgMvlAcXiFoT8Sv2yV7zgqPVxGNDd83CYiT0pdQombC_xq7GsHX_FARmYtyBEbfNudD_LTFZcuESQ3XIZrAfK1Glp29ZbJtsUJSAH23zCO3M1E7fY2Gzuayaa-DY5eWBM')" }}
                >
                    {/* Overlay for Contrast */}
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 lg:px-12 flex flex-col items-center">
                {/* Hero Text */}
                <div className="text-center mb-8 max-w-4xl animate-fadeIn">
                    <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-3 drop-shadow-2xl">
                        Explore the World
                    </h1>
                    <p className="text-white/90 text-base md:text-xl font-medium drop-shadow-md max-w-2xl mx-auto tracking-wide">
                        Seamless bookings. Extraordinary destinations.
                    </p>
                </div>

                {/* Main Search Panel - Adaptive Theme */}
                <div className="w-full max-w-[1100px] relative">
                    <div className="rounded-[2rem] p-6 md:p-8 shadow-2xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl border border-white/20 relative z-20 pb-16 transition-colors duration-300 mb-10">

                        {/* Trip Type Tabs */}
                        <div className="flex mb-6 gap-6 border-b border-black/5 dark:border-white/10 pb-0 w-fit">
                            {['round-trip', 'one-way', 'multi-city'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTripType(type)}
                                    className={`relative pb-3 text-sm font-bold tracking-wide transition-all ${tripType === type ? 'text-primary' : 'text-slate-600 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                                >
                                    {type.replace('-', ' ').toUpperCase()}
                                    <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full transition-transform duration-300 ${tripType === type ? 'scale-x-100' : 'scale-x-0'}`}></span>
                                </button>
                            ))}
                        </div>

                        {/* RENDER LOGIC BASED ON TRIP TYPE */}

                        {/* 1. ROUND TRIP & ONE WAY LAYOUT */}
                        {(tripType === 'round-trip' || tripType === 'one-way') && (
                            <div className="flex flex-col gap-4">

                                {/* Row 1: From - Swap - To */}
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 relative items-center">
                                    {/* FROM (Col Span 5) */}
                                    <div className="w-full md:col-span-5 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">From</label>
                                        <input
                                            type="text"
                                            value={`${from.city} (${from.code})`}
                                            readOnly
                                            className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 cursor-pointer w-full truncate placeholder-slate-400 dark:placeholder-white/30"
                                        />
                                        <span className="text-[11px] text-slate-500 dark:text-white/40 truncate">{from.country}</span>
                                    </div>

                                    {/* SWAP BUTTON (Gap of 2 cols, absolute center on desktop) */}
                                    <div className="md:col-span-2 relative flex justify-center z-30 my-[-18px] md:my-0">
                                        <button
                                            onClick={handleSwap}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white/80 hover:text-primary hover:border-primary shadow-lg transition-all md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:z-10 relative z-30 rotate-90 md:rotate-0"
                                        >
                                            <span className={`material-symbols-outlined text-xl transition-transform duration-500 ${isSwapped ? 'rotate-180' : 'rotate-0'}`}>sync_alt</span>
                                        </button>
                                    </div>

                                    {/* TO (Col Span 5) */}
                                    <div className="w-full md:col-span-5 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">To</label>
                                        <input
                                            type="text"
                                            value={`${to.city} (${to.code})`}
                                            readOnly
                                            className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 cursor-pointer w-full truncate placeholder-slate-400 dark:placeholder-white/30"
                                        />
                                        <span className="text-[11px] text-slate-500 dark:text-white/40 truncate">{to.country}</span>
                                    </div>
                                </div>

                                {/* Row 2: Dates & Travelers */}
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3">

                                    {/* DEPART DATE */}
                                    <div
                                        className={`w-full ${tripType === 'round-trip' ? 'md:col-span-3' : 'md:col-span-6'} h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group`}
                                        onClick={(e) => e.currentTarget.querySelector('input')?.showPicker()}
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Depart</label>
                                        <div className={`font-bold text-lg ${departDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                            {departDate || 'Select Date'}
                                        </div>
                                        <input
                                            type="date"
                                            className="absolute inset-0 opacity-0 pointer-events-none"
                                            onChange={(e) => setDepartDate(e.target.value)}
                                        />
                                    </div>

                                    {/* RETURN DATE (Round Trip Only) */}
                                    {tripType === 'round-trip' && (
                                        <div
                                            className="w-full md:col-span-3 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group"
                                            onClick={(e) => e.currentTarget.querySelector('input')?.showPicker()}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Return</label>
                                            <div className={`font-bold text-lg ${returnDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                                {returnDate || 'Select Date'}
                                            </div>
                                            <input
                                                type="date"
                                                className="absolute inset-0 opacity-0 pointer-events-none"
                                                onChange={(e) => setReturnDate(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* TRAVELERS (Col Span 6 for Round Trip, 6 for One Way) */}
                                    <div className={`w-full ${tripType === 'round-trip' ? 'md:col-span-6' : 'md:col-span-6'} relative`} ref={travelersRef}>
                                        <div
                                            className="h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer"
                                            onClick={() => setShowTravelers(!showTravelers)}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Travelers</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{totalTravelers}</span>
                                                <span className="text-slate-500 dark:text-white/60 text-sm">Passenger{totalTravelers > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        {/* Travelers Popover */}
                                        {showTravelers && (
                                            <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-5 z-50 animate-fadeIn">
                                                <div className="flex flex-col gap-4">
                                                    {[
                                                        { id: 'adults', label: 'Adults', sub: 'Age 13+' },
                                                        { id: 'children', label: 'Children', sub: 'Age 2-12' },
                                                        { id: 'infants', label: 'Infants', sub: 'Under 2' }
                                                    ].map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-slate-900 dark:text-white font-bold text-sm">{item.label}</div>
                                                                <div className="text-slate-500 dark:text-white/40 text-xs">{item.sub}</div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => updateTravelers(item.id as keyof typeof travelers, 'sub')}
                                                                    className={`w-7 h-7 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white transition-colors ${travelers[item.id as keyof typeof travelers] === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                                                    disabled={travelers[item.id as keyof typeof travelers] === 0}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="text-slate-900 dark:text-white font-bold w-4 text-center text-sm">{travelers[item.id as keyof typeof travelers]}</span>
                                                                <button
                                                                    onClick={() => updateTravelers(item.id as keyof typeof travelers, 'add')}
                                                                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-1">
                                                        <button
                                                            onClick={() => setShowTravelers(false)}
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
                        )}

                        {/* 2. MULTI-CITY LAYOUT */}
                        {tripType === 'multi-city' && (
                            <div className="flex flex-col gap-3">
                                {multiCityFlights.map((flight, index) => (
                                    <div key={flight.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-fadeIn">

                                        {/* Badge (1 col) */}
                                        <div className="hidden md:flex md:col-span-1 h-16 items-center justify-center bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl font-black text-slate-400 dark:text-white/20">
                                            {index + 1}
                                        </div>

                                        {/* FROM (3 cols) */}
                                        <div className="md:col-span-3 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all">
                                            <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 dark:text-white/40 mb-1">Flight {index + 1} From</span>
                                            <label className="hidden md:block text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">From</label>
                                            <div className="text-slate-900 dark:text-white font-bold text-lg truncate flex items-center gap-2">
                                                {flight.from.city} <span className="text-slate-400 dark:text-white/30 text-sm">({flight.from.code})</span>
                                            </div>
                                        </div>

                                        {/* SWAP (1 col - visual) */}
                                        <div className="flex justify-center -my-2 md:col-span-1 md:my-0 relative z-10">
                                            <span className="material-symbols-outlined text-slate-400 dark:text-white/20 rotate-90 md:rotate-0">arrow_forward</span>
                                        </div>

                                        {/* TO (3 cols) */}
                                        <div className="md:col-span-3 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all">
                                            <label className="hidden md:block text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">To</label>
                                            <div className="text-slate-900 dark:text-white font-bold text-lg truncate flex items-center gap-2">
                                                {flight.to.city} <span className="text-slate-400 dark:text-white/30 text-sm">({flight.to.code})</span>
                                            </div>
                                        </div>

                                        {/* DATE (4 cols) */}
                                        <div
                                            className="md:col-span-4 h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all relative cursor-pointer group"
                                            onClick={(e) => e.currentTarget.querySelector('input')?.showPicker()}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Date</label>
                                            <div className={`font-bold text-lg ${flight.date ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                                {flight.date || 'Select'}
                                            </div>
                                            <input
                                                type="date"
                                                className="absolute inset-0 opacity-0 pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Add Flight Button */}
                                <button className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl text-slate-500 dark:text-white/40 font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">add</span>
                                    Add Another Flight
                                </button>

                                {/* Travelers Row for Multi-City */}
                                <div className="relative mt-2" ref={travelersRef}>
                                    <div
                                        className="h-16 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer"
                                        onClick={() => setShowTravelers(!showTravelers)}
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Travelers</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-white font-bold text-lg">{totalTravelers}</span>
                                            <span className="text-slate-500 dark:text-white/60 text-sm">Passenger{totalTravelers > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    {/* Reuse Popover logic if needed, omitted here for brevity but assuming same as above */}
                                </div>
                            </div>
                        )}

                        {/* Search Button - Absolute Bottom Center */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-40 w-full max-w-sm px-4">
                            <button className="w-full relative py-4 bg-gradient-to-r from-primary to-[#FF8C42] rounded-full shadow-[0_15px_30px_-5px_rgba(255,94,31,0.5)] transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden text-white font-black text-lg tracking-wide uppercase">
                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                Search Flights
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Searches */}
                    <div className="mt-12 flex justify-center">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar max-w-full px-4 items-center">
                            <span className="text-white/60 font-medium text-xs uppercase tracking-wider py-2">Recent:</span>
                            {['NYC - LHR', 'DXB - SIN', 'HAN - HND'].map((route, i) => (
                                <div key={i} className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-white/90 text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap backdrop-blur-sm">
                                    {route}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
