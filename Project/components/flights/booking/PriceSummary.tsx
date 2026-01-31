"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { CheckCircle2, Ticket, Shield } from "lucide-react"

export function PriceSummary() {
    const { trip, seats, extras, insurance, useTcent, selectedFlights } = useBookingStore()

    // Price Calculation
    const totalFlightPrice = selectedFlights.reduce((acc, f) => acc + (f.price || 0), 0)
    const basePrice = (totalFlightPrice || 450) * trip.passengersCount
    const taxes = 125 * trip.passengersCount

    // Accurate Seat Cost
    const seatCost = Object.values(seats).filter(s => s !== '').length * 15

    // Accurate Baggage Cost
    const baggageCost = Object.values(extras.baggage).reduce((acc, bag) => {
        if (bag === '15kg') return acc + 25
        if (bag === '23kg') return acc + 40
        if (bag === '32kg') return acc + 60
        if (bag === 'extra') return acc + 75
        return acc
    }, 0)

    // Accurate Meal Cost
    const mealCost = Object.values(extras.meals).reduce((acc, meal) => {
        if (meal === 'no-meal') return acc
        if (meal === 'standard') return acc + 15
        if (meal === 'premium') return acc + 35
        return acc + 18 // veg, vegan, halal, gluten are all 18
    }, 0)

    const insuranceCost = (insurance === 'no' ? 0 : (insurance === 'basic' ? 19 : (insurance === 'standard' ? 39 : 69)) * trip.passengersCount)

    let total = basePrice + taxes + seatCost + baggageCost + mealCost + insuranceCost
    if (useTcent) total -= 50

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Price Summary</h3>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Flights (x{trip.passengersCount})</span>
                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Taxes & Fees</span>
                    <span className="font-medium">${taxes.toFixed(2)}</span>
                </div>

                {seatCost > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Seat Selection</span>
                        <span className="font-medium text-emerald-600">+${seatCost}</span>
                    </div>
                )}
                {baggageCost > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Baggage</span>
                        <span className="font-medium text-emerald-600">+${baggageCost}</span>
                    </div>
                )}
                {mealCost > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Meals</span>
                        <span className="font-medium text-emerald-600">+${mealCost}</span>
                    </div>
                )}
                {insuranceCost > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Insurance ({insurance})</span>
                        <span className="font-medium text-emerald-600">+${insuranceCost}</span>
                    </div>
                )}
                {useTcent && (
                    <div className="flex justify-between text-sm text-[#FF5E1F] font-bold">
                        <span>TCent Discount</span>
                        <span>-$50.00</span>
                    </div>
                )}

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>

                <div className="flex justify-between items-end">
                    <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                    <span className="font-black text-3xl text-[#FF5E1F]">${total.toFixed(2)}</span>
                </div>
                <p className="text-right text-xs text-slate-400">Includes all taxes and surcharges</p>
            </div>

            {/* Inclusions */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Best Price Guarantee</span>
                </div>
                <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Secure SSL Encryption</span>
                </div>
            </div>
        </div>
    )
}
