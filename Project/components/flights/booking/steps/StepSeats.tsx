"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { useState, useMemo } from "react"
import { FlightDetailsSummary } from "../FlightDetailsSummary"
import { Armchair, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function StepSeats() {
    const { setStep, selectSeat, seats, trip, passengers } = useBookingStore()
    const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound')
    const [activePassengerIdx, setActivePassengerIdx] = useState(0)
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)

    const activePassenger = passengers[activePassengerIdx]

    // Derived passenger count
    const totalPassengers = passengers.length > 0 ? passengers.length : (trip.passengersCount || 1)

    // Mock Seat Map Configuration
    const ROWS = 12
    const SEAT_LETTERS = ['A', 'B', 'C', '', 'D', 'E', 'F']

    // Generate simple pricing/logic mock
    const getSeatInfo = (row: number, col: string) => {
        const isExit = row === 10
        const isWindow = col === 'A' || col === 'F'
        const isAisle = col === 'C' || col === 'D'
        let price = 0
        let type = 'Standard'

        if (isExit) { price = 45; type = 'Exit Row' }
        else if (isWindow || isAisle) { price = 15; type = isWindow ? 'Window' : 'Aisle' }

        return { price, type }
    }

    const isSeatOccupied = (r: number, c: string) => {
        // Mock randomized occupation
        return (r * c.charCodeAt(0)) % 7 === 0
    }

    const handleSeatClick = (seatLabel: string, isOccupied: boolean) => {
        if (isOccupied) {
            toast.error("This seat is already taken.")
            return
        }

        const seatIdKey = `${activeTab}_${activePassenger.id}`
        const isSelectedByThisPassenger = seats[seatIdKey] === seatLabel

        if (isSelectedByThisPassenger) {
            selectSeat(seatIdKey, '') // Deselect
        } else {
            // Check if this seat is taken by ANOTHER passenger on the same leg
            const isTakenByOther = Object.entries(seats).some(([key, val]) =>
                key.startsWith(activeTab) && val === seatLabel && !key.endsWith(activePassenger.id)
            )

            if (isTakenByOther) {
                toast.error("This seat is already selected by another passenger.")
                return
            }

            selectSeat(seatIdKey, seatLabel)

            // Auto-advance to next passenger if available
            if (activePassengerIdx < passengers.length - 1) {
                setTimeout(() => setActivePassengerIdx(prev => prev + 1), 300)
            }
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <FlightDetailsSummary />

            {/* Passenger Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
                {passengers.map((p, idx) => (
                    <button
                        key={p.id}
                        onClick={() => setActivePassengerIdx(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activePassengerIdx === idx ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                    >
                        {p.firstName || `Passenger ${idx + 1}`}
                        {seats[`${activeTab}_${p.id}`] ? ` (${seats[`${activeTab}_${p.id}`]})` : ''}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                            <Armchair className="w-5 h-5 text-[#FF5E1F]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Seat for {activePassenger?.firstName || `Passenger ${activePassengerIdx + 1}`}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {activeTab === 'outbound' ? 'Outbound' : 'Return'} Flight
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('outbound')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'outbound' ? 'bg-white dark:bg-slate-700 text-[#FF5E1F] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Outbound
                        </button>
                        <button
                            onClick={() => setActiveTab('return')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'return' ? 'bg-white dark:bg-slate-700 text-[#FF5E1F] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Return
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-10 text-xs font-bold text-slate-600 dark:text-slate-400 justify-center">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-slate-300"></span> Standard</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> $15 Prefered</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> $45 Exit Row</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#FF5E1F]"></span> Selected</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 opacity-50 relative"><span className="absolute inset-0 flex items-center justify-center text-[8px]">✕</span></span> Taken</div>
                </div>

                {/* SVG Seat Map Container - Fixed Aspect Ratio and Padding */}
                <div className="relative w-full max-w-[320px] mx-auto select-none pb-12">
                    {/* Fuselage Shape - Adjusted for better fit */}
                    <svg viewBox="0 0 320 660" className="w-full h-auto drop-shadow-2xl overflow-visible">
                        <defs>
                            <linearGradient id="fuselage-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--fuselage-light)" />
                                <stop offset="50%" stopColor="var(--fuselage-mid)" />
                                <stop offset="100%" stopColor="var(--fuselage-light)" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 60,120 C 60,0 260,0 260,120 L 260,600 C 260,660 60,660 60,600 Z"
                            className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-2"
                        />
                        {/* Cockpit */}
                        <path d="M 130,50 Q 160,60 190,50" fill="none" className="stroke-slate-300 dark:stroke-slate-600 stroke-2" />

                        {/* Wings */}
                        <path d="M 60,280 L 10,310 L 10,400 L 60,360" className="fill-slate-50 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700" />
                        <path d="M 260,280 L 310,310 L 310,400 L 260,360" className="fill-slate-50 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700" />
                    </svg>

                    {/* Seats Grid - Absolutely positioned to match SVG */}
                    <div className="absolute inset-0 pt-[110px] pb-10 px-[70px] flex flex-col items-center">
                        <div className="grid grid-cols-7 gap-y-3 gap-x-1.5 w-full">
                            {/* Header */}
                            {SEAT_LETTERS.map((char, i) => (
                                <div key={i} className="text-center text-[10px] font-bold text-slate-300">{char}</div>
                            ))}

                            {/* Rows */}
                            {Array.from({ length: ROWS }).map((_, rowIndex) => {
                                const rowNum = rowIndex + 1
                                return SEAT_LETTERS.map((colChar, colIndex) => {
                                    if (!colChar) return <div key={`${rowIndex}-aisle`} className="flex items-center justify-center text-[9px] font-bold text-slate-200">{rowNum}</div>

                                    const seatIdKey = `${activeTab}_${activePassenger?.id}`
                                    const isSelectedByActive = seats[seatIdKey] === `${rowNum}${colChar}`
                                    const isTakenByOther = Object.entries(seats).some(([key, val]) =>
                                        key.startsWith(activeTab) && val === `${rowNum}${colChar}` && !key.endsWith(activePassenger?.id)
                                    )
                                    const isOccupied = isSeatOccupied(rowNum, colChar) || isTakenByOther
                                    const { price, type } = getSeatInfo(rowNum, colChar)

                                    let bgClass = "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                    if (isOccupied && !isTakenByOther) bgClass = "bg-slate-100 dark:bg-slate-800 border-transparent opacity-40 cursor-not-allowed"
                                    else if (isTakenByOther) bgClass = "bg-slate-200 dark:bg-slate-800 border-dashed border-slate-400 opacity-60 cursor-not-allowed"
                                    else if (isSelectedByActive) bgClass = "bg-[#FF5E1F] border-[#FF5E1F] text-white shadow-md shadow-orange-500/30 ring-1 ring-[#FF5E1F]"
                                    else if (type === 'Exit Row') bgClass = "bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-700"
                                    else if (type !== 'Standard') bgClass = "bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700"
                                    else bgClass = "hover:border-[#FF5E1F] hover:shadow-sm"

                                    return (
                                        <div key={`${rowNum}${colChar}`} className="relative group flex justify-center">
                                            <button
                                                onClick={() => handleSeatClick(`${rowNum}${colChar}`, isOccupied)}
                                                disabled={isOccupied}
                                                className={`
                                                    w-6 h-7 md:w-7 md:h-8 rounded-t-lg rounded-b-md border transition-all duration-200
                                                    ${bgClass}
                                                    flex items-center justify-center
                                                `}
                                            >
                                                {isSelectedByActive && <span className="text-[8px] font-bold">{rowNum}{colChar}</span>}
                                                {isOccupied && <span className="text-[8px]">✕</span>}
                                            </button>

                                            {/* Tooltip */}
                                            {!isOccupied && (
                                                <div className="
                                                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2
                                                    bg-slate-900/95 backdrop-blur-sm text-white text-[10px] rounded-lg 
                                                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50
                                                    shadow-xl flex flex-col items-center gap-0.5 whitespace-nowrap border border-white/10
                                                ">
                                                    <span className="font-bold text-xs">{rowNum}{colChar}</span>
                                                    <span className="opacity-80">{type}</span>
                                                    {price > 0 ? <span className="text-[#FF5E1F] font-bold">+${price}</span> : <span className="opacity-60">Included</span>}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            })}
                        </div>
                    </div>
                </div>

                {/* Validation Info */}
                <div className="absolute top-8 right-8 hidden xl:block">
                    <p className="text-xs text-slate-400 max-w-[120px] text-right">
                        <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                        Select {totalPassengers} seat{totalPassengers > 1 ? 's' : ''} for the best experience
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Back</button>
                <button
                    onClick={() => setStep(3)}
                    className="flex-1 ml-4 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    Continue to Extras <span className="opacity-60 text-xs normal-case">(Next)</span>
                </button>
            </div>
        </div>
    )
}
