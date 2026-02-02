"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { ArrowRightLeft, Users, Search, Plus, X, ArrowRight } from "lucide-react"
import { SearchHistoryItem } from '../common/SearchWithHistoryInput'
import { SelectPopup } from '../ui/SelectPopup'
import { CounterInput } from '../ui/CounterInput'
import { SimpleCalendar as Calendar } from '../ui/SimpleCalendar'
import { SearchWithHistoryInput } from '../common/SearchWithHistoryInput'
import { AIRPORTS, type Airport } from '@/lib/constants/airports'

const MAX_MULTI_CITY_FLIGHTS = 5

interface MultiCityFlight {
    id: number;
    from: Airport | null;
    to: Airport | null;
    date: Date | undefined;
    isOpen: boolean;
}

export function FlightsHero() {
    const router = useRouter()
    const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip')
    const [from, setFrom] = useState<Airport | null>(null)
    const [to, setTo] = useState<Airport | null>(null)
    const [departDate, setDepartDate] = useState<Date>()
    const [returnDate, setReturnDate] = useState<Date>()

    // Travelers State
    const [travelers, setTravelers] = useState({ adults: 1, children: 0 })
    const [activeTab, setActiveTab] = useState<'depart' | 'return' | 'travelers' | null>(null)
    const travelersRef = useRef<HTMLDivElement>(null)

    // Multi-City State
    const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
        { id: 1, from: null, to: null, date: undefined, isOpen: false }
    ])

    // Swap Animation State
    const [isSwapped, setIsSwapped] = useState(false)

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
        newFlights[index].isOpen = false
        setMultiCityFlights(newFlights)
    }

    const toggleMultiCityPopup = (index: number, isOpen: boolean) => {
        const newFlights = [...multiCityFlights]
        newFlights[index].isOpen = isOpen
        setMultiCityFlights(newFlights)
    }

    const updateMultiCityFrom = (index: number, airport: Airport) => {
        const newFlights = [...multiCityFlights]
        newFlights[index].from = airport
        setMultiCityFlights(newFlights)
    }

    const updateMultiCityTo = (index: number, airport: Airport) => {
        const newFlights = [...multiCityFlights]
        newFlights[index].to = airport
        setMultiCityFlights(newFlights)
    }

    const addMultiCityFlight = () => {
        if (multiCityFlights.length >= MAX_MULTI_CITY_FLIGHTS) {
            toast.error(`Maximum ${MAX_MULTI_CITY_FLIGHTS} flight segments allowed`)
            return
        }
        const lastFlight = multiCityFlights[multiCityFlights.length - 1]
        setMultiCityFlights([
            ...multiCityFlights,
            {
                id: multiCityFlights.length + 1,
                from: lastFlight.to, // Pre-populate with previous destination
                to: null,
                date: undefined,
                isOpen: false
            }
        ])
    }

    const removeMultiCityFlight = (index: number) => {
        if (multiCityFlights.length === 1) {
            toast.error("At least one flight segment is required")
            return
        }
        setMultiCityFlights(multiCityFlights.filter((_, i) => i !== index))
    }

    const handleSearch = () => {
        // Validation
        if (tripType !== 'multi-city') {
            if (!from) {
                toast.error("Please select a departure airport.")
                return
            }
            if (!to) {
                toast.error("Please select a destination airport.")
                return
            }
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

            // Save search history
            try {
                fetch("/api/user/history", {
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
        } else {
            // Multi-city validation
            for (let i = 0; i < multiCityFlights.length; i++) {
                const flight = multiCityFlights[i]
                if (!flight.from) {
                    toast.error(`Please select departure airport for Flight ${i + 1}`)
                    return
                }
                if (!flight.to) {
                    toast.error(`Please select destination airport for Flight ${i + 1}`)
                    return
                }
                if (!flight.date) {
                    toast.error(`Please select a date for Flight ${i + 1}`)
                    return
                }
            }
        }

        if (tripType !== 'multi-city' && from && to) {
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
        } else {
            // Multi-city search (implement as needed)
            toast.info("Multi-city search coming soon!")
        }
    }

    const getAirportDisplay = (airport: Airport) => {
        return `${airport.city} (${airport.code})`
    }

    const renderAirportResult = (airport: Airport) => {
        return (
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
    }

    const handleRouteSelect = (item: SearchHistoryItem) => {
        const params = item.search_params;
        if (params.from && params.to) {
            setFrom(params.from);
            setTo(params.to);
            if (params.tripType) setTripType(params.tripType);
        }
    }

    const renderRouteHistory = (item: SearchHistoryItem) => {
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
                            {(['round-trip', 'one-way', 'multi-city'] as const).map((type) => (
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
                                    <div className="w-full md:col-span-5">
                                        <SearchWithHistoryInput
                                            data={AIRPORTS}
                                            searchKeys={['code', 'city', 'name', 'country']}
                                            placeholder="Search airport..."
                                            onSelect={(airport) => setFrom(airport)}
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
                                    </div>

                                    <div className="md:col-span-2 relative flex justify-center z-40 my-[-18px] md:my-0">
                                        <button
                                            onClick={handleSwap}
                                            disabled={!from || !to}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-white/80 hover:text-[#FF5E1F] hover:border-[#FF5E1F] shadow-lg transition-all md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 relative z-30 rotate-90 md:rotate-0 group disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ArrowRightLeft className={`w-4 h-4 transition-transform duration-500 ${isSwapped ? 'rotate-180' : 'rotate-0'}`} />
                                        </button>
                                    </div>

                                    <div className="w-full md:col-span-5">
                                        <SearchWithHistoryInput
                                            data={AIRPORTS}
                                            searchKeys={['code', 'city', 'name', 'country']}
                                            placeholder="Search airport..."
                                            onSelect={(airport) => setTo(airport)}
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
                                </div>

                                {/* Dates & Travelers */}
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3">
                                    <div
                                        className={`w-full ${tripType === 'round-trip' ? 'md:col-span-3' : 'md:col-span-6'} bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 cursor-pointer relative ${activeTab === 'depart' ? 'bg-white dark:bg-white/10 ring-2 ring-[#FF5E1F]/20' : ''}`}
                                        onClick={() => setActiveTab('depart')}
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Depart</label>
                                        <div className={`font-bold text-lg ${departDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                            {departDate ? departDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                                        </div>

                                        <SelectPopup
                                            isOpen={activeTab === 'depart'}
                                            onClose={() => setActiveTab(null)}
                                            className="w-[340px]"
                                        >
                                            <Calendar
                                                selectedDate={departDate}
                                                onSelect={(d) => {
                                                    setDepartDate(d)
                                                    setActiveTab(null)
                                                }}
                                                minDate={new Date()}
                                            />
                                        </SelectPopup>
                                    </div>

                                    {tripType === 'round-trip' && (
                                        <div
                                            className={`w-full md:col-span-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 cursor-pointer relative ${activeTab === 'return' ? 'bg-white dark:bg-white/10 ring-2 ring-[#FF5E1F]/20' : ''}`}
                                            onClick={() => setActiveTab('return')}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Return</label>
                                            <div className={`font-bold text-lg ${returnDate ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                                {returnDate ? returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                                            </div>

                                            <SelectPopup
                                                isOpen={activeTab === 'return'}
                                                onClose={() => setActiveTab(null)}
                                                className="w-[340px]"
                                            >
                                                <Calendar
                                                    selectedDate={returnDate}
                                                    onSelect={(d) => {
                                                        setReturnDate(d)
                                                        setActiveTab(null)
                                                    }}
                                                    minDate={departDate || new Date()}
                                                />
                                            </SelectPopup>
                                        </div>
                                    )}

                                    {/* Travelers */}
                                    <div className={`${tripType === 'round-trip' ? 'md:col-span-6' : 'md:col-span-6'} relative`} ref={travelersRef}>
                                        <div
                                            className={`h-full min-h-[4rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 cursor-pointer ${activeTab === 'travelers' ? 'bg-white dark:bg-white/10 ring-2 ring-[#FF5E1F]/20' : ''}`}
                                            onClick={() => setActiveTab('travelers')}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Travelers</label>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#FF5E1F]" />
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{totalTravelers}</span>
                                                <span className="text-slate-500 dark:text-white/60 text-sm">Passenger{totalTravelers > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        <SelectPopup
                                            isOpen={activeTab === 'travelers'}
                                            onClose={() => setActiveTab(null)}
                                            className="w-[320px] right-0 left-auto"
                                        >
                                            <div className="flex flex-col">
                                                <CounterInput
                                                    label="Adults"
                                                    subLabel="Age 12+"
                                                    value={travelers.adults}
                                                    onChange={(v) => updateTravelers('adults', v > travelers.adults ? 'add' : 'sub')}
                                                    min={1}
                                                />
                                                <CounterInput
                                                    label="Children"
                                                    subLabel="Age 2-11"
                                                    value={travelers.children}
                                                    onChange={(v) => updateTravelers('children', v > travelers.children ? 'add' : 'sub')}
                                                />

                                                <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setActiveTab(null)
                                                        }}
                                                        className="w-full py-2 bg-[#FF5E1F] hover:bg-orange-600 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </SelectPopup>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. MULTI-CITY LAYOUT */}
                        {tripType === 'multi-city' && (
                            <div className="flex flex-col gap-3">
                                {multiCityFlights.map((flight, index) => (
                                    <div key={flight.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start animate-in fade-in">
                                        {/* Badge & Remove */}
                                        <div className="hidden md:flex md:col-span-1 h-14 items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl font-black text-slate-400 relative">
                                            {index + 1}
                                            {multiCityFlights.length > 1 && (
                                                <button
                                                    onClick={() => removeMultiCityFlight(index)}
                                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        {/* From */}
                                        <div className="md:col-span-3">
                                            <SearchWithHistoryInput
                                                data={AIRPORTS}
                                                searchKeys={['code', 'city', 'name', 'country']}
                                                placeholder="From..."
                                                onSelect={(airport) => updateMultiCityFrom(index, airport)}
                                                category="flight"
                                                historyType="origin"
                                                label={`Flight ${index + 1} - From`}
                                                renderResult={renderAirportResult}
                                                getDisplayValue={getAirportDisplay}
                                                value={flight.from ? getAirportDisplay(flight.from) : ''}
                                            />
                                        </div>

                                        {/* To */}
                                        <div className="md:col-span-3">
                                            <SearchWithHistoryInput
                                                data={AIRPORTS}
                                                searchKeys={['code', 'city', 'name', 'country']}
                                                placeholder="To..."
                                                onSelect={(airport) => updateMultiCityTo(index, airport)}
                                                category="flight"
                                                historyType="destination"
                                                label="To"
                                                renderResult={renderAirportResult}
                                                getDisplayValue={getAirportDisplay}
                                                value={flight.to ? getAirportDisplay(flight.to) : ''}
                                            />
                                        </div>

                                        {/* Date */}
                                        <div
                                            className={`md:col-span-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 cursor-pointer relative ${flight.isOpen ? 'bg-white dark:bg-white/10 ring-2 ring-[#FF5E1F]/20' : ''}`}
                                            onClick={() => toggleMultiCityPopup(index, true)}
                                        >
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Date</label>
                                            <div className={`font-bold ${flight.date ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                                {flight.date ? flight.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                                            </div>

                                            <SelectPopup
                                                isOpen={flight.isOpen}
                                                onClose={() => toggleMultiCityPopup(index, false)}
                                                className="w-[340px] right-0 left-auto"
                                            >
                                                <Calendar
                                                    selectedDate={flight.date}
                                                    onSelect={(d) => updateMultiCityDate(index, d)}
                                                    minDate={new Date()}
                                                />
                                            </SelectPopup>
                                        </div>
                                    </div>
                                ))}
                                {multiCityFlights.length < MAX_MULTI_CITY_FLIGHTS && (
                                    <button
                                        onClick={addMultiCityFlight}
                                        className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl text-slate-500 hover:text-[#FF5E1F] hover:border-[#FF5E1F] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Another Flight
                                    </button>
                                )}
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
                </div>
            </div>
        </div>
    )
}
