"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Plane, ArrowRightLeft, Users, Search, Plus } from "lucide-react"

// Mock Data
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
    const router = useRouter()
    const [tripType, setTripType] = useState('round-trip')
    const [from, setFrom] = useState(AIRPORTS[3]) // JFK default
    const [to, setTo] = useState(AIRPORTS[4]) // LHR default
    const [departDate, setDepartDate] = useState<Date>()
    const [returnDate, setReturnDate] = useState<Date>()

    // Travelers State
    const [travelers, setTravelers] = useState({ adults: 1, children: 0 })
    const [showTravelers, setShowTravelers] = useState(false)
    const travelersRef = useRef<HTMLDivElement>(null)

    // Multi-City State (Adapted for DatePicker)
    const [multiCityFlights, setMultiCityFlights] = useState([
        { id: 1, from: AIRPORTS[0], to: AIRPORTS[1], date: undefined as Date | undefined },
        { id: 2, from: AIRPORTS[1], to: AIRPORTS[2], date: undefined as Date | undefined }
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
            // Validation: Minimum 1 adult
            if (type === 'adults' && newValue < 1) {
                toast.error("At least one adult is required.")
                return prev
            }
            return { ...prev, [type]: newValue }
        })
    }

    const totalTravelers = travelers.adults + travelers.children

    const updateMultiCityDate = (index: number, date: Date | undefined) => {
        const newFlights = [...multiCityFlights]
        newFlights[index].date = date
        setMultiCityFlights(newFlights)
    }

    const handleSearch = () => {
        // Validation
        if (tripType !== 'multi-city') {
            if (!departDate) {
                toast.error("Please select a departure date.")
                return
            }
            if (tripType === 'round-trip' && !returnDate) {
                toast.error("Please select a return date.")
                return
            }
            // Check if return date is after depart date
            if (returnDate && departDate && returnDate < departDate) {
                toast.error("Return date must be after departure date.")
                return
            }
        } else {
            // Minimal validation for multi-city
            const invalidFlight = multiCityFlights.find(f => !f.date)
            if (invalidFlight) {
                toast.error(`Please select a date for Flight ${invalidFlight.id}`)
                return
            }
        }

        const params = new URLSearchParams({
            from: from.code,
            fromCity: from.city,
            to: to.code,
            toCity: to.city,
            depart: departDate ? departDate.toISOString() : '',
            return: returnDate ? returnDate.toISOString() : '',
            tripType,
            adults: travelers.adults.toString(),
            children: travelers.children.toString(),
        })

        // Push logic
        router.push(`/flights/search?${params.toString()}`)
    }

    return (
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center px-4 py-8 lg:px-0">
            {/* Background & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSW5ptZcWxu-M07XsgjJgkGMtddb2TBJjvhRkOkTzQYWDC5ExzqFjvo6re-SXnq25ibzXANFSKxDGmNJYEZ1A0MUur144EyC5c1E1ZIjaJOcDmtZWSTLwmwhL5twIrPRYAvzILXrn8o4JgMvlAcXiFoT8Sv2yV7zgqPVxGNDd83CYiT0pdQombC_xq7GsHX_FARmYtyBEbfNudD_LTFZcuESQ3XIZrAfK1Glp29ZbJtsUJSAH23zCO3M1E7fY2Gzuayaa-DY5eWBM')" }}
                >
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 lg:px-12 flex flex-col items-center">
                {/* Hero Text */}
                <div className="text-center mb-8 max-w-4xl animate-fadeIn">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
                        <Plane className="w-4 h-4 text-[#FF5E1F]" />
                        <span>Discover the world with comfort</span>
                    </div>
                    <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-3 drop-shadow-2xl">
                        Explore the World
                    </h1>
                    <p className="text-white/90 text-base md:text-xl font-medium drop-shadow-md max-w-2xl mx-auto tracking-wide">
                        Seamless bookings. Extraordinary destinations.
                    </p>
                </div>

                {/* Main Search Panel */}
                <div className="w-full max-w-[1100px] relative">
                    <div className="rounded-[2rem] p-6 md:p-8 shadow-2xl bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl border border-white/20 relative z-20 pb-20 transition-colors duration-300 mb-10">

                        {/* Trip Type Tabs */}
                        <div className="flex mb-6 gap-6 border-b border-black/5 dark:border-white/10 pb-0 w-fit">
                            {['round-trip', 'one-way', 'multi-city'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTripType(type)}
                                    className={`relative pb-3 text-sm font-bold tracking-wide transition-all ${tripType === type ? 'text-[#FF5E1F]' : 'text-slate-600 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                                >
                                    {type.replace('-', ' ').toUpperCase()}
                                    <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#FF5E1F] rounded-t-full transition-transform duration-300 ${tripType === type ? 'scale-x-100' : 'scale-x-0'}`}></span>
                                </button>
                            ))}
                        </div>

                        {/* RENDER LOGIC */}
                        {(tripType === 'round-trip' || tripType === 'one-way') && (
                            <div className="flex flex-col gap-4">
                                {/* Route: From - Swap - To */}
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 relative items-center">
                                    <div className="w-full md:col-span-5 h-16 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 group">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">From</label>
                                        <div className="text-slate-900 dark:text-white font-black text-xl truncate">{from.city} ({from.code})</div>
                                        <span className="text-[11px] text-slate-400 dark:text-white/40 truncate">{from.country}</span>
                                    </div>

                                    <div className="md:col-span-2 relative flex justify-center z-30 my-[-18px] md:my-0">
                                        <button
                                            onClick={handleSwap}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-white/80 hover:text-[#FF5E1F] hover:border-[#FF5E1F] shadow-lg transition-all md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 relative z-30 rotate-90 md:rotate-0 group"
                                        >
                                            <ArrowRightLeft className={`w-4 h-4 transition-transform duration-500 ${isSwapped ? 'rotate-180' : 'rotate-0'}`} />
                                        </button>
                                    </div>

                                    <div className="w-full md:col-span-5 h-16 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 group">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">To</label>
                                        <div className="text-slate-900 dark:text-white font-black text-xl truncate">{to.city} ({to.code})</div>
                                        <span className="text-[11px] text-slate-400 dark:text-white/40 truncate">{to.country}</span>
                                    </div>
                                </div>

                                {/* Dates & Travelers */}
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3">
                                    <div className={`w-full ${tripType === 'round-trip' ? 'md:col-span-3' : 'md:col-span-6'} bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-2 transition-all hover:bg-white dark:hover:bg-white/10`}>
                                        <DatePicker
                                            label="Depart"
                                            date={departDate}
                                            onSelect={setDepartDate}
                                            placeholder="Select Date"
                                            className="w-full"
                                            variant="inline"
                                        />
                                    </div>

                                    {tripType === 'round-trip' && (
                                        <div className="w-full md:col-span-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-2 transition-all hover:bg-white dark:hover:bg-white/10">
                                            <DatePicker
                                                label="Return"
                                                date={returnDate}
                                                onSelect={setReturnDate}
                                                placeholder="Select Date"
                                                minDate={departDate}
                                                className="w-full"
                                                variant="inline"
                                            />
                                        </div>
                                    )}

                                    {/* Travelers */}
                                    <div className={`${tripType === 'round-trip' ? 'md:col-span-6' : 'md:col-span-6'} relative`} ref={travelersRef}>
                                        <div
                                            className="h-full min-h-[4rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 cursor-pointer"
                                            onClick={() => setShowTravelers(!showTravelers)}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Travelers</label>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#FF5E1F]" />
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{totalTravelers}</span>
                                                <span className="text-slate-500 dark:text-white/60 text-sm">Passenger{totalTravelers > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        {showTravelers && (
                                            <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex flex-col gap-4">
                                                    {[
                                                        { id: 'adults', label: 'Adults', sub: 'Age 12+' },
                                                        { id: 'children', label: 'Children', sub: 'Age 2-11' },
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
                                                            className="w-full py-2 bg-[#FF5E1F] hover:bg-orange-600 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors"
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

                        {/* 3. MULTI-CITY LAYOUT */}
                        {tripType === 'multi-city' && (
                            <div className="flex flex-col gap-3">
                                {multiCityFlights.map((flight, index) => (
                                    <div key={flight.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-in fade-in">
                                        {/* Badge */}
                                        <div className="hidden md:flex md:col-span-1 h-14 items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl font-black text-slate-400">
                                            {index + 1}
                                        </div>

                                        {/* Route */}
                                        <div className="md:col-span-6 h-14 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex items-center justify-between">
                                            <div className="text-slate-900 dark:text-white font-bold">{flight.from.city}</div>
                                            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                                            <div className="text-slate-900 dark:text-white font-bold">{flight.to.city}</div>
                                        </div>

                                        {/* Date */}
                                        <div className="md:col-span-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-1">
                                            <DatePicker
                                                // No label for compactness
                                                date={flight.date}
                                                onSelect={(d) => updateMultiCityDate(index, d)}
                                                placeholder="Select Date"
                                                variant="inline"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl text-slate-500 hover:text-[#FF5E1F] hover:border-[#FF5E1F] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Another Flight
                                </button>
                            </div>
                        )}

                        {/* Search Action */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-40 w-full max-w-sm px-4">
                            <button
                                onClick={handleSearch}
                                className="w-full relative py-4 bg-[#FF5E1F] hover:bg-[#E54810] rounded-full shadow-[0_15px_30px_-5px_rgba(255,94,31,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden text-white font-black text-lg tracking-wide uppercase">
                                <Search className="w-6 h-6" />
                                Search Flights
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
