"use client"

import { Check } from 'lucide-react'

export interface FilterState {
    stops: string[]
    departureTime: string[]
    maxPrice: number
    airlines: string[]
}

interface FlightFilterSidebarProps {
    filters: FilterState
    setFilters: (filters: FilterState) => void
    minPrice: number
    maxPriceLimit: number
}

// Layout: Standard OTAs Sidebar (Booking.com style)
export function FlightFilterSidebar({ filters, setFilters, minPrice, maxPriceLimit }: FlightFilterSidebarProps) {

    // --- Handlers ---

    const handleStopChange = (stop: string) => {
        const newStops = filters.stops.includes(stop)
            ? filters.stops.filter((s) => s !== stop)
            : [...filters.stops, stop]
        setFilters({ ...filters, stops: newStops })
    }

    const handleTimeChange = (time: string) => {
        const newTimes = filters.departureTime.includes(time)
            ? filters.departureTime.filter((t) => t !== time)
            : [...filters.departureTime, time]
        setFilters({ ...filters, departureTime: newTimes })
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
    }

    const handleAirlineChange = (airline: string) => {
        const newAirlines = filters.airlines.includes(airline)
            ? filters.airlines.filter((a) => a !== airline)
            : [...filters.airlines, airline]
        setFilters({ ...filters, airlines: newAirlines })
    }

    const handleReset = () => {
        setFilters({
            stops: [],
            departureTime: [],
            maxPrice: maxPriceLimit,
            airlines: []
        })
    }

    return (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-8 lg:sticky lg:top-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Filters
                </h3>
                <button
                    onClick={handleReset}
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Stops */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Stops</h4>
                <div className="space-y-3">
                    {[
                        { label: 'Direct', value: '0' },
                        { label: '1 Stop', value: '1' },
                        { label: '2+ Stops', value: '2+' }
                    ].map((opt, i) => {
                        const isChecked = filters.stops.includes(opt.value)
                        return (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`relative flex items-center justify-center w-5 h-5 border rounded-[6px] transition-colors ${isChecked ? 'border-orange-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-orange-500'}`}>
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
                                        checked={isChecked}
                                        onChange={() => handleStopChange(opt.value)}
                                    />
                                    <Check className={`w-3.5 h-3.5 text-white absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                                    <div className={`w-full h-full rounded-[5px] absolute inset-0 bg-transparent transition-colors ${isChecked ? 'bg-orange-500' : ''}`} />
                                </div>
                                <div className="flex-1 flex justify-between text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    <span>{opt.label}</span>
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Departure Time */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Departure Time</h4>
                <div className="grid grid-cols-2 gap-2">
                    {['00-06', '06-12', '12-18', '18-24'].map((time) => {
                        const isSelected = filters.departureTime.includes(time)
                        return (
                            <button
                                key={time}
                                onClick={() => handleTimeChange(time)}
                                className={`border rounded-lg py-2 text-xs font-semibold transition-all ${isSelected
                                    ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white bg-transparent'
                                    }`}
                            >
                                {time}h
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Max Price</h4>
                <div className="px-1">
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPriceLimit}
                        value={filters.maxPrice}
                        onChange={handlePriceChange}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex items-center justify-between mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span>${filters.maxPrice}</span>
                        <span>${maxPriceLimit}</span>
                    </div>
                </div>
            </div>

            {/* Airlines */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Airlines</h4>
                <div className="space-y-3">
                    {['American Airlines', 'Delta Air Lines', 'United Airlines', 'Emirates', 'Qatar Airways', 'JetBlue', 'Alaska Airlines', 'Vietnam Airlines', 'VietJet Air', 'Bamboo Airways'].map((airline, i) => {
                        const isChecked = filters.airlines.includes(airline)
                        return (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`relative flex items-center justify-center w-5 h-5 border rounded-[6px] transition-colors ${isChecked ? 'border-orange-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-orange-500'}`}>
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
                                        checked={isChecked}
                                        onChange={() => handleAirlineChange(airline)}
                                    />
                                    <Check className={`w-3.5 h-3.5 text-white absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                                    <div className={`w-full h-full rounded-[5px] absolute inset-0 bg-transparent transition-colors ${isChecked ? 'bg-orange-500' : ''}`} />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{airline}</span>
                            </label>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
