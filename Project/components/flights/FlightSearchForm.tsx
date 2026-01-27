"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Users, ArrowRightLeft, Search, Edit2 } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"

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

interface FlightSearchFormProps {
    compact?: boolean
    onSearch?: () => void
    initialValues?: {
        from?: string
        to?: string
        depart?: string
        return?: string
        tripType?: string
        adults?: number
        children?: number
    }
}

export function FlightSearchForm({ compact = false, onSearch, initialValues }: FlightSearchFormProps) {
    const router = useRouter()

    // Initialize state
    const [tripType, setTripType] = useState(initialValues?.tripType || 'round-trip')
    const [travelClass, setTravelClass] = useState('Economy')
    const [directFlightsOnly, setDirectFlightsOnly] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false) // Mobile expand state

    // Helper to find airport object by code
    const findAirport = (code?: string) => AIRPORTS.find(a => a.code === code) || AIRPORTS[3]

    const [from, setFrom] = useState(initialValues?.from ? findAirport(initialValues.from) : AIRPORTS[3])
    const [to, setTo] = useState(initialValues?.to ? findAirport(initialValues.to) : AIRPORTS[4])

    const [departDate, setDepartDate] = useState(initialValues?.depart || '')
    const [returnDate, setReturnDate] = useState(initialValues?.return || '')

    const [travelers, setTravelers] = useState({
        adults: initialValues?.adults || 1,
        children: initialValues?.children || 0
    })

    const [showTravelers, setShowTravelers] = useState(false)
    const travelersRef = useRef<HTMLDivElement>(null)

    const [isSwapped, setIsSwapped] = useState(false)

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

    const handleTripTypeChange = (type: string) => {
        setTripType(type)
        if (type === 'one-way') {
            setReturnDate('')
        }
    }

    const updateTravelers = (type: keyof typeof travelers, operation: 'add' | 'sub') => {
        setTravelers(prev => {
            const newValue = operation === 'add' ? prev[type] + 1 : prev[type] - 1
            if (newValue < 0) return prev
            if (type === 'adults' && newValue < 1) return prev
            return { ...prev, [type]: newValue }
        })
    }

    const totalTravelers = travelers.adults + travelers.children

    const handleSearchClick = () => {
        const params = new URLSearchParams({
            from: from.code,
            fromCity: from.city,
            to: to.code,
            toCity: to.city,
            depart: departDate,
            return: returnDate,
            tripType,
            adults: travelers.adults.toString(),
            children: travelers.children.toString(),
            class: travelClass,
            direct: directFlightsOnly.toString()
        })

        const url = `/flights/search?${params.toString()}`
        router.push(url)
        if (onSearch) onSearch()
        setIsExpanded(false) // Collapse on search
    }

    return (
        <div className="w-full font-sans mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* MOBILE COMPACT SUMMARY (Visible only on mobile when collapsed) */}
            <div className={`lg:hidden bg-white dark:bg-[#18181b] rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-4 mb-4 ${isExpanded ? 'hidden' : 'flex'} items-center justify-between`}>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                        <span>{from.code}</span>
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                        <span>{to.code}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{departDate ? new Date(departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add Date'}</span>
                        {returnDate && <span>- {new Date(returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{totalTravelers} Pax</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(true)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[#FF5E1F]"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
            </div>

            {/* FULL FORM (Hidden on mobile unless expanded, always visible desktop) */}
            <div className={`${!isExpanded ? 'hidden lg:block' : 'block'} animate-in fade-in slide-in-from-top-4 duration-300`}>

                {/* Mobile Header with Close Button */}
                <div className="flex lg:hidden justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Search</h2>
                    <button onClick={() => setIsExpanded(false)} className="text-slate-500">Cancel</button>
                </div>

                {/* Top Options Bar */}
                <div className={`flex flex-wrap items-center gap-4 mb-4 px-1 ${compact ? 'text-sm' : 'text-base'}`}>
                    {/* Trip Type Radios */}
                    <div className="flex bg-[#f4f4f5] dark:bg-white/5 rounded-lg p-1">
                        {['round-trip', 'one-way', 'multi-city'].map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTripTypeChange(type)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tripType === type ? 'bg-white dark:bg-slate-700 text-[#FF5E1F] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    {/* Class Dropdown (Mock) */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs lg:text-sm whitespace-nowrap">
                            {travelClass} <span className="text-[10px] opacity-60">▼</span>
                        </button>
                    </div>

                    {/* Direct Flights Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={directFlightsOnly}
                            onChange={(e) => setDirectFlightsOnly(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-[#FF5E1F] focus:ring-[#FF5E1F]"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">Direct flights only</span>
                    </label>
                </div>


                {/* Main Search Bar Container */}
                <div className={`
                    flex flex-col lg:grid lg:grid-cols-[1.2fr_auto_1.2fr_1.5fr_1fr_auto] 
                    bg-white dark:bg-[#18181b] 
                    rounded-2xl 
                    shadow-xl border border-slate-200 dark:border-slate-800 
                    relative z-20 
                    divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800
                `}>

                    {/* 1. Origin */}
                    <div className="relative group hover:bg-[#fcfaf8] dark:hover:bg-white/5 transition-colors first:rounded-t-2xl lg:first:rounded-l-2xl lg:first:rounded-tr-none">
                        <div className="relative flex items-center gap-3 h-full px-5 py-3 lg:px-5 lg:py-3 cursor-pointer">
                            <Plane className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F] transition-colors shrink-0" />
                            <div className="flex flex-col justify-center overflow-hidden w-full relative z-10">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">From</span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={`${from.city} (${from.code})`}
                                        readOnly
                                        className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-sm focus:ring-0 cursor-pointer truncate placeholder-slate-400"
                                        onClick={() => {/* Open Origin Picker */ }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Swap Slot */}
                    <div className="relative h-0 lg:h-auto lg:w-0 flex items-center justify-center z-30">
                        <div className="absolute top-0 left-1/2 lg:left-0 -translate-x-1/2 -translate-y-1/2 lg:translate-x-[-50%] lg:translate-y-0 lg:static lg:transform-none lg:w-0">
                            <button
                                onClick={handleSwap}
                                className="w-8 h-8 rounded-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-400 hover:text-[#FF5E1F] hover:border-[#FF5E1F] transition-all active:scale-95 group z-30 relative lg:absolute lg:top-1/2 lg:left-0 lg:-translate-y-1/2 lg:-translate-x-1/2"
                                aria-label="Swap locations"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Destination */}
                    <div className="relative group hover:bg-[#fcfaf8] dark:hover:bg-white/5 transition-colors">
                        <div className="relative flex items-center gap-3 h-full px-5 py-3 lg:px-5 lg:py-3 cursor-pointer">
                            <Plane className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F] transition-colors shrink-0 rotate-90" />
                            <div className="flex flex-col justify-center overflow-hidden w-full relative z-10">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">To</span>
                                <input
                                    type="text"
                                    value={`${to.city} (${to.code})`}
                                    readOnly
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-sm focus:ring-0 cursor-pointer truncate placeholder-slate-400"
                                    onClick={() => {/* Open Destination Picker */ }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Dates */}
                    <div className="relative group hover:bg-[#fcfaf8] dark:hover:bg-white/5 transition-colors">
                        <div className="relative flex items-center h-full px-5 py-3 lg:px-5 lg:py-3 gap-2">
                            <div className="flex-1 min-w-0">
                                <DatePicker
                                    label="Depart"
                                    date={departDate ? new Date(departDate) : undefined}
                                    onSelect={(d) => setDepartDate(d ? d.toISOString() : '')}
                                    placeholder="Add Date"
                                    className="w-full"
                                    variant="ghost"
                                />
                            </div>
                            {tripType === 'round-trip' && (
                                <div className="flex-1 min-w-0 border-l border-slate-200 dark:border-slate-800 pl-2">
                                    <DatePicker
                                        label="Return"
                                        date={returnDate ? new Date(returnDate) : undefined}
                                        onSelect={(d) => setReturnDate(d ? d.toISOString() : '')}
                                        placeholder="Add Date"
                                        minDate={departDate ? new Date(departDate) : undefined}
                                        className="w-full"
                                        variant="ghost"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Travelers */}
                    <div className="relative group hover:bg-[#fcfaf8] dark:hover:bg-white/5 transition-colors cursor-pointer select-none"
                        ref={travelersRef}
                    >
                        <div
                            className="relative flex items-center gap-3 h-full px-5 py-3 lg:px-5 lg:py-3"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowTravelers(!showTravelers);
                            }}
                        >
                            <Users className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F] transition-colors shrink-0" />
                            <div className="flex flex-col justify-center w-full relative z-10">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Travelers</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                        <span className="lg:hidden">{totalTravelers}</span>
                                        <span className="hidden lg:inline">{totalTravelers} Passenger{totalTravelers !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Popover */}
                        {showTravelers && (
                            <div className="absolute top-full right-0 mt-3 w-full lg:w-80 max-w-sm bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-5 z-50 animate-fadeIn cursor-default border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                                <div className="space-y-6">
                                    {/* Adults */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm text-slate-900 dark:text-white">Adults</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age 13+</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateTravelers('adults', 'sub')}
                                                disabled={travelers.adults <= 1}
                                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-[#FF5E1F] hover:text-[#FF5E1F] disabled:opacity-30 disabled:hover:border-slate-200 transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-6 text-center text-slate-900 dark:text-white">{travelers.adults}</span>
                                            <button
                                                onClick={() => updateTravelers('adults', 'add')}
                                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm text-slate-900 dark:text-white">Children</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age 0-12</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateTravelers('children', 'sub')}
                                                disabled={travelers.children <= 0} // Min 0
                                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-[#FF5E1F] hover:text-[#FF5E1F] disabled:opacity-30 disabled:hover:border-slate-200 transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-6 text-center text-slate-900 dark:text-white">{travelers.children}</span>
                                            <button
                                                onClick={() => updateTravelers('children', 'add')}
                                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setShowTravelers(false)}
                                            className="w-full py-2.5 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 5. Search Button */}
                    <div className="p-3 lg:p-2">
                        <button
                            onClick={handleSearchClick}
                            className="h-14 lg:h-full w-full lg:w-auto px-6 lg:px-8 bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base lg:text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Search className="w-5 h-5 lg:w-4 lg:h-4" />
                            <span className="lg:hidden xl:inline">Search</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
