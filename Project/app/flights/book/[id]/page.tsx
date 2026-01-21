"use client"

import { FlightSummaryCard } from "@/components/flights/detail/FlightSummaryCard"
import { FlightTimeline } from "@/components/flights/detail/FlightTimeline"
import { FareBreakdown } from "@/components/flights/detail/FareBreakdown"
import { FlightPolicies } from "@/components/flights/detail/FlightPolicies"
import { Footer } from "@/components/Footer"

// Mock Data
const FLIGHT_DETAILS = {
    summary: {
        from: "New York (JFK)",
        to: "London (LHR)",
        date: "Fri, 24 Oct 2026",
        passengers: 1,
        class: "Economy"
    },
    outbound: {
        airline: "Virgin Atlantic",
        flightValues: "VS 026",
        duration: "7h 10m",
        departure: {
            time: "08:15",
            airport: "John F. Kennedy Intl",
            airportCode: "JFK",
            terminal: "Terminal 4"
        },
        arrival: {
            time: "20:25",
            airport: "Heathrow Airport",
            airportCode: "LHR",
            terminal: "Terminal 3"
        }
    },
    price: {
        base: 450.00,
        tax: 125.40,
        total: 575.40
    }
}

export default function FlightDetailsPage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* Standard Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* 1. Summary Header */}
                <FlightSummaryCard data={FLIGHT_DETAILS.summary} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Details (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Flight Itinerary</h2>

                        {/* Outbound Timeline */}
                        <div className="space-y-4">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-2">Outbound</span>
                            <FlightTimeline data={FLIGHT_DETAILS.outbound} />
                        </div>

                        {/* Return would go here if round trip */}

                        <FlightPolicies />
                    </div>

                    {/* Right Column: Sticky Price (4 cols) */}
                    <div className="lg:col-span-4 h-full">
                        <FareBreakdown price={FLIGHT_DETAILS.price} />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
