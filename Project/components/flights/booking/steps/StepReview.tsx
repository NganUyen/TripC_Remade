"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, Mail, Phone, Briefcase, Shield, SquareEqual, Utensils } from "lucide-react"
import { FlightDetailsSummary } from "../FlightDetailsSummary"

export function StepReview() {
    const { setStep, passengers, contact, seats, extras, insurance, trip, useTcent, selectedFlights } = useBookingStore()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleProceedToPayment = async () => {
        if (!trip.date) {
            toast.error("Missing flight date. Please go back and select a date.")
            return
        }

        setIsSubmitting(true)
        try {
            const totalFlightPrice = selectedFlights.reduce((acc, f) => acc + (f.price || 0), 0)
            const basePrice = (totalFlightPrice || 450) * (trip.passengersCount || 1)
            const taxes = 125 * (trip.passengersCount || 1)
            const seatCost = Object.keys(seats).length * 15
            const baggageCost = Object.keys(extras.baggage).length * 35
            const insuranceCost = insurance === 'no' ? 0 : (insurance === 'basic' ? 20 : (insurance === 'standard' ? 40 : 80)) * (trip.passengersCount || 1)

            let total = basePrice + taxes + seatCost + baggageCost + insuranceCost
            if (useTcent) total -= 50

            const description = selectedFlights.map(f => `${f.airline} ${f.flightNumber} (${f.departure?.airport} -> ${f.arrival?.airport})`).join(' | ')

            const outboundFlight = selectedFlights[0]
            const returnFlight = selectedFlights.length > 1 ? selectedFlights[1] : null

            const payload = {
                category: 'flight',
                title: `Flight: ${trip.from} to ${trip.to}`,
                description: `${description} • ${trip.class} • ${trip.passengersCount} Passengers`,
                imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=2670&auto=format&fit=crop",
                locationSummary: `${trip.from} -> ${trip.to}`,
                startDate: outboundFlight?.rawDepartureAt || trip.date,
                endDate: returnFlight?.rawDepartureAt || returnFlight?.rawArrivalAt || trip.returnDate || trip.date,
                totalAmount: total,
                currency: 'USD',
                guestDetails: {
                    contact,
                    passengers: passengers.map(p => ({
                        ...p,
                        outboundSeat: seats[`outbound_${p.id}`] || 'Not selected',
                        returnSeat: seats[`return_${p.id}`] || (trip.returnDate ? 'Not selected' : 'N/A'),
                        outboundBaggage: extras.baggage[`outbound_${p.id}`] || 'None',
                        returnBaggage: extras.baggage[`return_${p.id}`] || (trip.returnDate ? 'None' : 'N/A'),
                        outboundMeal: extras.meals[`outbound_${p.id}`] || 'None',
                        returnMeal: extras.meals[`return_${p.id}`] || (trip.returnDate ? 'None' : 'N/A'),
                    })),
                    insurance,
                    flights: selectedFlights
                },
                metadata: {
                    trip,
                    seats,
                    extras,
                    insurance,
                    selectedFlights,
                    flightId: outboundFlight?.id,
                    offerId: outboundFlight?.id, // Use flight ID as offer ID in this mock
                    contactInfo: contact
                }
            }

            const res = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to create booking")
            }

            const booking = await res.json()
            toast.success("Booking initialized!")
            router.push(`/checkout?bookingId=${booking.bookingId}`)

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "An error occurred")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review Booking</h2>
                <p className="text-slate-500 dark:text-slate-400">Please review all details before proceeding to payment.</p>
            </div>

            <FlightDetailsSummary />

            {/* Passengers Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-900 dark:text-white" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Passenger Details</h3>
                </div>

                {passengers.map((p, index) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                            <span className="font-bold text-slate-900 dark:text-white">Passenger {index + 1}</span>
                            <span className="text-xs font-bold text-[#FF5E1F] uppercase tracking-wider">{p.gender}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                <p className="font-bold text-slate-900 dark:text-white">{p.firstName} {p.lastName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passport / Nationality</p>
                                <p className="font-bold text-slate-900 dark:text-white">{p.passportNumber} ({p.nationality})</p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <SquareEqual className="w-4 h-4 text-[#FF5E1F]" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seats</p>
                                    <p className="font-bold text-xs">
                                        Out: {seats[`outbound_${p.id}`] || "None"}
                                        {trip.returnDate ? ` | Ret: ${seats[`return_${p.id}`] || "None"}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <Briefcase className="w-4 h-4 text-[#FF5E1F]" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baggage</p>
                                    <p className="font-bold text-xs">
                                        Out: {extras.baggage[`outbound_${p.id}`] || "7kg"}
                                        {trip.returnDate ? ` | Ret: ${extras.baggage[`return_${p.id}`] || "7kg"}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <Utensils className="w-4 h-4 text-[#FF5E1F]" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meals</p>
                                    <p className="font-bold text-xs">
                                        Out: {extras.meals[`outbound_${p.id}`] || "None"}
                                        {trip.returnDate ? ` | Ret: ${extras.meals[`return_${p.id}`] || "None"}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Extras & Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Mail className="w-5 h-5 text-[#FF5E1F]" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Contact Info</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold">{contact.phone}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-[#FF5E1F]" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Insurance Plan</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{insurance} Protection</p>
                            <p className="text-xs text-slate-500">Comprehensive travel coverage</p>
                        </div>
                        {insurance !== 'no' && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => setStep(4)}
                    disabled={isSubmitting}
                    className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                    Back to Insurance
                </button>
                <button
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className="min-w-[240px] px-8 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        'Proceed to Payment'
                    )}
                </button>
            </div>
        </div>
    )
}
