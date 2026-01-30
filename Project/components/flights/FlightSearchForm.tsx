"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"
import { ArrowRightLeft, Users, Search, Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import { SelectPopup } from '../ui/SelectPopup'
import { CounterInput } from '../ui/CounterInput'
import { SimpleCalendar as Calendar } from '../ui/SimpleCalendar'
import { SearchWithHistoryInput } from '../common/SearchWithHistoryInput'
import { AIRPORTS, type Airport } from '@/lib/constants/airports'
import { cn } from '@/lib/utils'

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
    className?: string
}

export function FlightSearchForm({ compact, onSearch, initialValues, className }: FlightSearchFormProps) {
    const router = useRouter()

    // State
    const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>(
        (initialValues?.tripType as any) || 'round-trip'
    )
    const [from, setFrom] = useState<Airport | null>(null)
    const [to, setTo] = useState<Airport | null>(null)
    const [departDate, setDepartDate] = useState<Date | undefined>(
        initialValues?.depart ? new Date(initialValues.depart) : undefined
    )
    const [returnDate, setReturnDate] = useState<Date | undefined>(
        initialValues?.return ? new Date(initialValues.return) : undefined
    )

    const [travelers, setTravelers] = useState({
        adults: initialValues?.adults || 1,
        children: initialValues?.children || 0
    })

    const [activeTab, setActiveTab] = useState<'depart' | 'return' | 'travelers' | null>(null)
    const [isSwapped, setIsSwapped] = useState(false)

    // Initialize from/to based on codes if provided
    useEffect(() => {
        if (initialValues?.from && !from) {
            const found = AIRPORTS.find(a => a.code === initialValues.from)
            if (found) setFrom(found)
        }
        if (initialValues?.to && !to) {
            const found = AIRPORTS.find(a => a.code === initialValues.to)
            if (found) setTo(found)
        }
    }, [initialValues])


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
            if (type === 'adults' && newValue < 1) {
                toast.error("At least one adult is required.")
                return prev
            }
            return { ...prev, [type]: newValue }
        })
    }

    const totalTravelers = travelers.adults + travelers.children

    const handleSearch = async () => {
        // Validation
        if (!from) return toast.error("Please select a departure airport.")
        if (!to) return toast.error("Please select a destination airport.")
        if (!departDate) return toast.error("Please select a departure date.")
        if (tripType === 'round-trip' && !returnDate) return toast.error("Please select a return date.")
        if (returnDate && departDate && returnDate < departDate) return toast.error("Return date must be after departure date.")

        // Save search history
        try {
            await fetch("/api/user/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: "flight",
                    searchParams: {
                        query: `${from.city} -> ${to.city}`,
                        timestamp: new Date().toISOString(),
                        type: "flight_route",
                        from,
                        to,
                        tripType
                    },
                }),
            });
        } catch (error) {
            console.error("Failed to save route history", error)
        }

        if (onSearch) onSearch()

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
        router.push(`/flights/search?${params.toString()}`)
    }

    const handleRouteSelect = (item: any) => {
        const params = item.search_params;
        if (params.from && params.to) {
            setFrom(params.from);
            setTo(params.to);
            if (params.tripType) setTripType(params.tripType);
        }
    }

    const renderRouteHistory = (item: any) => {
        const params = item.search_params;
        if (params.type === 'flight_route' && params.from && params.to) {
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-slate-900 dark:text-white">{params.from.city}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-900 dark:text-white">{params.to.city}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {params.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                    </span>
                </div>
            )
        }
        return <span>{params.query}</span>;
    }

    const getAirportDisplay = (airport: Airport) => `${airport.city} (${airport.code})`

    const renderAirportResult = (airport: Airport) => (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{airport.city}</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{airport.code}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
                {airport.name} • {airport.country}
            </div>
        </div>
    )

    return (
        <div className={cn("w-full bg-white dark:bg-[#18181b] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-5", className)}>
            {/* Trip Type Tabs */}
            <div className="flex mb-4 gap-6 border-b border-slate-100 dark:border-white/10 pb-0 w-fit">
                {(['round-trip', 'one-way'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setTripType(type)}
                        className={cn(
                            "relative pb-3 text-xs font-bold tracking-wide transition-all",
                            tripType === type
                                ? "text-[#FF5E1F]"
                                : "text-slate-500 dark:text-white/60 hover:text-black dark:hover:text-white"
                        )}
                    >
                        {type.replace('-', ' ').toUpperCase()}
                        <span className={cn(
                            "absolute bottom-0 left-0 w-full h-[2px] bg-[#FF5E1F] rounded-t-full transition-transform duration-300",
                            tripType === type ? "scale-x-100" : "scale-x-0"
                        )} />
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
                {/* Inputs Route */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 relative items-center">
                    <SearchWithHistoryInput
                        data={AIRPORTS}
                        searchKeys={['code', 'city', 'name', 'country']}
                        placeholder="From..."
                        onSelect={setFrom}
                        category="flight"
                        historyType="flight_route"
                        label="From"
                        renderResult={renderAirportResult}
                        getDisplayValue={getAirportDisplay}
                        value={from ? getAirportDisplay(from) : ''}
                        onHistorySelect={handleRouteSelect}
                        renderHistoryItem={renderRouteHistory}
                        disableLocalSave={true}
                    />

                    <div className="flex justify-center z-40 -my-4 md:my-0">
                        <button
                            onClick={handleSwap}
                            disabled={!from || !to}
                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-400 dark:text-white/60 hover:text-[#FF5E1F] hover:border-[#FF5E1F] transition-all rotate-90 md:rotate-0"
                        >
                            <ArrowRightLeft className="w-3 h-3" />
                        </button>
                    </div>

                    <SearchWithHistoryInput
                        data={AIRPORTS}
                        searchKeys={['code', 'city', 'name', 'country']}
                        placeholder="To..."
                        onSelect={setTo}
                        category="flight"
                        historyType="flight_route"
                        label="To"
                        renderResult={renderAirportResult}
                        getDisplayValue={getAirportDisplay}
                        value={to ? getAirportDisplay(to) : ''}
                        onHistorySelect={handleRouteSelect}
                        renderHistoryItem={renderRouteHistory}
                        disableLocalSave={true}
                    />
                </div>

                {/* Dates & Travelers */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Depart */}
                    <div
                        className={cn(
                            "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 cursor-pointer relative transition-all hover:bg-slate-100 dark:hover:bg-white/10",
                            activeTab === 'depart' && "ring-2 ring-[#FF5E1F]/20 bg-white dark:bg-white/10"
                        )}
                        onClick={() => setActiveTab('depart')}
                    >
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold">Depart</label>
                        <div className="font-bold text-sm truncate flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            {departDate ? departDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
                        </div>
                        <SelectPopup isOpen={activeTab === 'depart'} onClose={() => setActiveTab(null)} className="w-[300px]">
                            <Calendar selectedDate={departDate} onSelect={(d) => { setDepartDate(d); setActiveTab(null) }} minDate={new Date()} />
                        </SelectPopup>
                    </div>

                    {/* Return */}
                    <div
                        className={cn(
                            "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 cursor-pointer relative transition-all hover:bg-slate-100 dark:hover:bg-white/10",
                            (activeTab === 'return' && tripType === 'round-trip') && "ring-2 ring-[#FF5E1F]/20 bg-white dark:bg-white/10",
                            tripType === 'one-way' && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => tripType === 'round-trip' && setActiveTab('return')}
                    >
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold">Return</label>
                        <div className="font-bold text-sm truncate flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            {tripType === 'round-trip' ? (returnDate ? returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date') : '-'}
                        </div>
                        {tripType === 'round-trip' && (
                            <SelectPopup isOpen={activeTab === 'return'} onClose={() => setActiveTab(null)} className="w-[300px]">
                                <Calendar selectedDate={returnDate} onSelect={(d) => { setReturnDate(d); setActiveTab(null) }} minDate={departDate || new Date()} />
                            </SelectPopup>
                        )}
                    </div>

                    {/* Travelers - Span 2 on mobile if needed, or stick to grid */}
                    <div
                        className={cn(
                            "col-span-2 lg:col-span-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 cursor-pointer relative transition-all hover:bg-slate-100 dark:hover:bg-white/10",
                            activeTab === 'travelers' && "ring-2 ring-[#FF5E1F]/20 bg-white dark:bg-white/10"
                        )}
                        onClick={() => setActiveTab('travelers')}
                    >
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold">Travelers</label>
                        <div className="font-bold text-sm truncate flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            {totalTravelers} Pax
                        </div>
                        <SelectPopup isOpen={activeTab === 'travelers'} onClose={() => setActiveTab(null)} className="w-[280px] right-0 left-auto">
                            <div className="flex flex-col">
                                <CounterInput label="Adults" value={travelers.adults} onChange={(v) => updateTravelers('adults', v > travelers.adults ? 'add' : 'sub')} min={1} />
                                <CounterInput label="Children" value={travelers.children} onChange={(v) => updateTravelers('children', v > travelers.children ? 'add' : 'sub')} />
                            </div>
                        </SelectPopup>
                    </div>
                </div>

                {/* Search Button */}
                <div className="">
                    <button
                        onClick={handleSearch}
                        className="h-full w-full lg:w-auto px-8 bg-[#FF5E1F] hover:bg-[#E54810] rounded-xl text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <Search className="w-5 h-5" />
                        <span className="lg:hidden">Search</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
