"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

// Components
import { FlightFilterSidebar } from '@/components/flights/search/FlightFilterSidebar'
import { FlightSortBar } from '@/components/flights/search/FlightSortBar'
import { FlightResultCard } from '@/components/flights/search/FlightResultCard'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'
import { FlightDetailsModal } from '@/components/flights/search/FlightDetailsModal'
import { Pagination } from '@/components/ui/Pagination'
import { Footer } from '@/components/Footer'

// Utils
import { generateFlights } from '@/lib/mock/flights'

function SearchContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- Search Params ---
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
    const [sortBy, setSortBy] = useState('price')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7 // Show 7 cards per page

    // Derived Data
    const currentFrom = selectionStep === 'outbound' ? fromCode : toCode
    const currentTo = selectionStep === 'outbound' ? toCode : fromCode
    const currentDate = selectionStep === 'outbound' ? departDateRaw : returnDateRaw

    useEffect(() => {
        // Mock API Call
        setFlights(generateFlights(currentFrom, currentTo, currentDate, 35))
        setCurrentPage(1)
    }, [currentFrom, currentTo, currentDate])

    // --- derived list ---
    const sortedFlights = [...flights].sort((a, b) => {
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
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20 font-sans">

            {/* --- Simplifed Header (Not Sticky) --- */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-transform duration-300 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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

            {/* --- Content Grid --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 delay-100">
                <div className="flex flex-col lg:flex-row gap-8 relative">

                    {/* Sidebar Filters - Fixed Width on Desktop */}
                    <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 h-fit sticky top-24 space-y-6">
                        <FlightFilterSidebar />
                    </aside>

                    {/* Main Results - Fluid */}
                    <main className="flex-1 min-w-0 space-y-6">
                        <FlightSortBar sortBy={sortBy} onSortChange={setSortBy} count={flights.length} />

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
