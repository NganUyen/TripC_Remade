"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

// Components
// Components
import { FlightFilterSidebar, FilterState } from '@/components/flights/search/FlightFilterSidebar'
import { FlightSortBar } from '@/components/flights/search/FlightSortBar'
import { FlightResultCard } from '@/components/flights/search/FlightResultCard'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'
import { FlightDetailsModal } from '@/components/flights/search/FlightDetailsModal'
import { Pagination } from '@/components/ui/Pagination'
import { Footer } from '@/components/Footer'

// Utils
import { generateFlights } from '@/lib/mock/flights'

import { useSupabaseClient } from '@/lib/supabase'

function SearchContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = useSupabaseClient()

    // ... Search Params ...
    const fromCity = searchParams.get('fromCity') || 'New York'
    const fromCode = searchParams.get('from') || 'JFK'
    const toCity = searchParams.get('toCity') || 'London'
    const toCode = searchParams.get('to') || 'LHR'
    const departDateRaw = searchParams.get('depart') || ''

    // Trip Logic
    const tripType = searchParams.get('tripType') || 'round-trip'
    const returnDateRaw = searchParams.get('return') || ''

    const adults = parseInt(searchParams.get('adults') || '1')
    const children = parseInt(searchParams.get('children') || '0')
    const infants = parseInt(searchParams.get('infants') || '0')

    // --- State ---
    const [selectionStep, setSelectionStep] = useState<'outbound' | 'return'>('outbound')
    const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null)
    const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null)
    const [detailsFlight, setDetailsFlight] = useState<any | null>(null)

    // Data State
    const [flights, setFlights] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sortBy, setSortBy] = useState('price')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7 // Show 7 cards per page

    // Filter State
    const [filterState, setFilterState] = useState<FilterState>({
        stops: [],
        departureTime: [],
        maxPrice: 2500,
        airlines: []
    })

    // Derived Data
    const currentFrom = selectionStep === 'outbound' ? fromCode : toCode
    const currentTo = selectionStep === 'outbound' ? toCode : fromCode
    const currentDate = selectionStep === 'outbound' ? departDateRaw : returnDateRaw

    useEffect(() => {
        async function fetchFlights() {
            setIsLoading(true)

            // Try to fetch from Supabase first
            try {
                const startOfDay = new Date(currentDate)
                startOfDay.setHours(0, 0, 0, 0)
                const endOfDay = new Date(currentDate)
                endOfDay.setHours(23, 59, 59, 999)

                const { data, error } = await supabase
                    .from('flights')
                    .select('*')
                    .eq('origin', currentFrom)
                    .eq('destination', currentTo)
                    .gte('departure_at', startOfDay.toISOString())
                    .lte('departure_at', endOfDay.toISOString())
                    .eq('status', 'active')

                if (error || !data || data.length === 0) {
                    console.log("No DB flights found, falling back to mock.")
                    setFlights(generateFlights(currentFrom, currentTo, currentDate, 35))
                } else {
                    const mapped = data.map(f => {
                        const depAt = new Date(f.departure_at)
                        const arrAt = new Date(f.arrival_at)

                        // Calculate duration in hours and minutes
                        const diffMs = arrAt.getTime() - depAt.getTime()
                        const diffMins = Math.floor(diffMs / 60000)
                        const durationHours = Math.floor(diffMins / 60)
                        const durationMinutes = diffMins % 60

                        // Calculate daysAdded
                        const depDate = new Date(depAt.getFullYear(), depAt.getMonth(), depAt.getDate())
                        const arrDate = new Date(arrAt.getFullYear(), arrAt.getMonth(), arrAt.getDate())
                        const daysAdded = Math.floor((arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24))

                        return {
                            id: f.id,
                            airline: f.airline_name,
                            airlineCode: f.airline_code,
                            airlineColor: f.airline_code === 'VN' ? 'bg-[#004280]' : (f.airline_code === 'VJ' ? 'bg-red-500' : 'bg-emerald-500'),
                            flightNumber: f.flight_number,
                            departure: {
                                time: depAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                airport: f.origin,
                                date: depAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            },
                            arrival: {
                                time: arrAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                airport: f.destination,
                                date: arrAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                                daysAdded: daysAdded > 0 ? daysAdded : 0
                            },
                            duration: `${durationHours}h ${durationMinutes}m`,
                            stops: 0,
                            price: Number(f.base_price) / 25000,
                            isBestValue: false
                        }
                    })
                    setFlights(mapped)
                }
            } catch (err) {
                console.error("Fetch error:", err)
                setFlights(generateFlights(currentFrom, currentTo, currentDate, 35))
            } finally {
                setIsLoading(false)
                setCurrentPage(1)
                setFilterState(prev => ({ ...prev, stops: [], departureTime: [], airlines: [] }))
            }
        }

        if (currentDate) {
            fetchFlights()
        }
    }, [currentFrom, currentTo, currentDate, supabase])

    // --- Filter Logic ---
    const filteredFlights = flights.filter(flight => {
        // Stops
        if (filterState.stops.length > 0) {
            const stopsStr = flight.stops === 0 ? '0' : flight.stops === 1 ? '1' : '2+'
            if (!filterState.stops.includes(stopsStr)) return false
        }

        // Departure Time
        if (filterState.departureTime.length > 0) {
            const hour = parseInt(flight.departure.time.split(':')[0])
            const matchesTime = filterState.departureTime.some(range => {
                if (range === '00-06') return hour >= 0 && hour < 6
                if (range === '06-12') return hour >= 6 && hour < 12
                if (range === '12-18') return hour >= 12 && hour < 18
                if (range === '18-24') return hour >= 18 && hour < 24
                return false
            })
            if (!matchesTime) return false
        }

        // Price
        if (flight.price > filterState.maxPrice) return false

        // Airlines
        if (filterState.airlines.length > 0) {
            if (!filterState.airlines.includes(flight.airline)) return false
        }

        return true
    })

    // --- derived list ---
    const sortedFlights = [...filteredFlights].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price
        if (sortBy === 'duration') return parseInt(a.duration) - parseInt(b.duration)
        if (sortBy === 'departure') return a.departure.time.localeCompare(b.departure.time)
        return 0
    })

    const totalPages = Math.ceil(sortedFlights.length / itemsPerPage)
    const displayedFlights = sortedFlights.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // --- Handlers ---
    const handleConfirmSelection = () => {
        if (!detailsFlight) return
        const flightId = detailsFlight.id
        setDetailsFlight(null)

        if (selectionStep === 'outbound') {
            setSelectedOutboundId(flightId)
            if (tripType === 'round-trip') {
                setSelectionStep('return')
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                proceedToBooking(flightId, null)
            }
        } else {
            setSelectedReturnId(flightId)
            proceedToBooking(selectedOutboundId!, flightId)
        }
    }

    const proceedToBooking = (outboundId: string, returnId: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('flightIdOutbound', outboundId)
        if (returnId) params.set('flightIdReturn', returnId)
        router.push(`/flights/book?${params.toString()}`)
    }

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-sans">

            {/* --- Simplifed Header (Not Sticky) --- */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-transform duration-300 sticky top-0 z-40">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-start">
                        <button
                            onClick={() => router.push('/flights')}
                            className="mt-2 lg:mt-6 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-[#FF5E1F] transition-all shrink-0 shadow-sm"
                            title="Back to Flight Search"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Mobile Back Button */}
                        <button
                            onClick={() => router.push('/flights')}
                            className="lg:hidden flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="flex-1 w-full">
                            <FlightSearchForm
                                compact
                                onSearch={() => setSelectionStep('outbound')}
                                initialValues={{
                                    from: fromCode, to: toCode,
                                    depart: departDateRaw, return: returnDateRaw,
                                    tripType, adults, children
                                }}
                            />

                            {/* Compact Step Indicator */}
                            {tripType === 'round-trip' && (
                                <div className="mt-3 flex items-center gap-4 text-xs font-bold tracking-wide pl-1">
                                    <div className={`flex items-center gap-2 transition-colors ${selectionStep === 'outbound' ? 'text-[#FF5E1F]' : 'text-slate-400'}`}>
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${selectionStep === 'outbound' ? 'bg-[#FF5E1F] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                                        Outbound Flight
                                    </div>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                    <div className={`flex items-center gap-2 transition-colors ${selectionStep === 'return' ? 'text-[#FF5E1F]' : 'text-slate-400'}`}>
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${selectionStep === 'return' ? 'bg-[#FF5E1F] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                                        Return Flight
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 delay-100">
                <div className="flex flex-col lg:flex-row gap-8 relative">

                    {/* Sidebar Filters - Fixed Width on Desktop */}
                    <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 h-fit sticky top-24 space-y-6">
                        <FlightFilterSidebar
                            filters={filterState}
                            setFilters={setFilterState}
                            minPrice={0}
                            maxPriceLimit={2500}
                        />
                    </aside>

                    {/* Main Results - Fluid */}
                    <main className="flex-1 min-w-0 space-y-6">
                        <FlightSortBar sortBy={sortBy} onSortChange={setSortBy} count={sortedFlights.length} />

                        <div className="space-y-4">
                            {displayedFlights.map((flight) => (
                                <FlightResultCard
                                    key={flight.id}
                                    flight={flight}
                                    onSelect={() => setDetailsFlight(flight)} // Open modal first on select/click
                                    isSelected={flight.id === selectedOutboundId}
                                />
                            ))}

                            {/* Empty State */}
                            {flights.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">No flights found</h3>
                                    <p className="text-sm text-slate-500 mt-1">Try changing your dates or filters.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </main>
                </div>
            </div>

            {/* --- Modals/Overlays --- */}
            <FlightDetailsModal
                flight={detailsFlight}
                isOpen={!!detailsFlight}
                onClose={() => setDetailsFlight(null)}
                onConfirm={handleConfirmSelection}
            />

            <Footer />
        </div>
    )
}

export default function FlightSearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]" />}>
            <SearchContent />
        </Suspense>
    )
}
