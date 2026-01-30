"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBookingStore } from '@/store/useBookingStore'
import { PriceSummary } from '@/components/flights/booking/PriceSummary'
import { BookingStepper } from '@/components/flights/booking/BookingStepper'
import { StepPassengers } from '@/components/flights/booking/steps/StepPassengers'
import { StepSeats } from '@/components/flights/booking/steps/StepSeats'
import { StepExtras } from '@/components/flights/booking/steps/StepExtras'
import { StepInsurance } from '@/components/flights/booking/steps/StepInsurance'
import { StepReview } from '@/components/flights/booking/steps/StepReview'
import { StepPayment } from '@/components/flights/booking/steps/StepPayment'
import { Footer } from '@/components/Footer'

import { getFlightById } from '@/lib/actions/flights'

function BookingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { step, setTrip, setSelectedFlights } = useBookingStore()

    // Initialize from URL
    useEffect(() => {
        const from = searchParams.get("from")
        const to = searchParams.get("to")
        const date = searchParams.get("date") || searchParams.get("departure") || searchParams.get("depart")
        const returnDate = searchParams.get("returnDate") || searchParams.get("return")

        const flightIdOutbound = searchParams.get("flightIdOutbound")
        const flightIdReturn = searchParams.get("flightIdReturn")

        async function initBooking() {
            setTrip({
                from: from || "",
                to: to || "",
                date: date || "",
                returnDate: returnDate || undefined,
                passengersCount: parseInt(searchParams.get("passengers") || "1"),
                class: searchParams.get("class") || "Economy"
            })

            const flights = []
            if (flightIdOutbound) {
                const f = await getFlightById(flightIdOutbound)
                if (f) flights.push(f)
            }
            if (flightIdReturn) {
                const f = await getFlightById(flightIdReturn)
                if (f) flights.push(f)
            }

            if (flights.length > 0) {
                setSelectedFlights(flights)
            }
        }

        initBooking()
    }, [searchParams, setTrip, setSelectedFlights])

    const renderStep = () => {
        switch (step) {
            case 1: return <StepPassengers />
            case 2: return <StepSeats />
            case 3: return <StepExtras />
            case 4: return <StepInsurance />
            case 5: return <StepReview />
            case 6: return <StepPayment />
            default: return <StepPassengers />
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top Stepper */}
            <div className="mb-10 sticky top-0 z-20 bg-[#fcfaf8] dark:bg-[#0a0a0a] pt-4 pb-2">
                <BookingStepper />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                {/* Main Content (Left 8) */}
                <div className="lg:col-span-8 min-h-[600px]">
                    {renderStep()}
                </div>

                {/* Sticky Sidebar (Right 4) */}
                <div className="lg:col-span-4 hidden lg:block h-full">
                    <div className="sticky top-24 space-y-6">
                        <PriceSummary />

                        {/* TCent Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg mb-1">Earn 450 TCent</h4>
                                <p className="text-white/80 text-sm mb-4">on this booking</p>
                                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-[#FF5E1F]"></div>
                                </div>
                                <p className="text-xs mt-2 text-white/60">Tier Progress</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default function BookingPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* Suspense boundary for useSearchParams */}
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <BookingContent />
            </Suspense>
            <Footer />
        </main>
    )
}
