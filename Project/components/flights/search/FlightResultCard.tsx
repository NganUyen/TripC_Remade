"use client"

import { Clock, ArrowRight, Plane, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface FlightResultCardProps {
    flight: {
        id: string
        airline: string
        airlineCode?: string
        airlineColor?: string
        flightNumber: string
        departure: { time: string, airport: string }
        arrival: { time: string, airport: string }
        duration: string
        stops: number
        price: number
        isBestValue?: boolean
    }
    onSelect: () => void
    isSelected?: boolean
}

export function FlightResultCard({ flight, onSelect, isSelected }: FlightResultCardProps) {
    return (
        <div className="group transition-transform duration-300 transform-gpu mb-4">
            <div className={`
                bg-white dark:bg-slate-900 rounded-xl 
                border ${isSelected ? 'border-[#FF5E1F] bg-orange-50/10' : 'border-slate-100 dark:border-slate-800'} 
                shadow-sm hover:shadow-md transition-all duration-300 transform-gpu
                relative overflow-hidden
            `}>
                {/* Best Value Badge - Clean & Minimal */}
                {flight.isBestValue && (
                    <div className="absolute top-0 right-0 bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                        Best Value
                    </div>
                )}

                <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.5fr_2fr_1.2fr] gap-6 items-center">

                    {/* 1. Airline (Secondary Focus) */}
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm ${flight.airlineColor || 'bg-slate-500'}`}>
                            {flight.airlineCode || 'FL'}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{flight.airline}</h4>
                            <span className="text-xs text-slate-400 font-medium mt-0.5">{flight.flightNumber} • Boeing 737</span>
                        </div>
                    </div>

                    {/* 2. Timeline (Information Focus) */}
                    <div className="flex items-center justify-between gap-6 px-4">
                        {/* Departure */}
                        <div className="text-center min-w-[70px]">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{flight.departure.time}</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{flight.departure.airport}</div>
                        </div>

                        {/* Duration Path */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-[10px] font-medium text-slate-400 mb-1">{flight.duration}</div>
                            <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
                                {/* Simple dot or plane */}
                                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-full">
                                    <Plane className="w-3 h-3 text-slate-300 rotate-90" />
                                </div>
                            </div>
                            <div className={`mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${flight.stops === 0 ? 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center min-w-[70px]">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{flight.arrival.time}</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{flight.arrival.airport}</div>
                        </div>
                    </div>

                    {/* 3. Price & Action (Primary Focus) */}
                    <div className="flex items-center justify-end gap-5 pl-4 border-l border-slate-50 dark:border-white/5">
                        <div className="flex flex-col items-end text-right">
                            <span className="text-xs text-slate-400 line-through">${flight.price + 45}</span>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-sm font-semibold text-[#FF5E1F]">$</span>
                                <span className="text-3xl font-black text-[#FF5E1F] tracking-tight">{flight.price}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">/pax</span>
                        </div>

                        <button
                            onClick={onSelect}
                            className={`
                                h-11 px-6 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2
                                ${isSelected
                                    ? 'bg-slate-900 text-white shadow-none cursor-default'
                                    : 'bg-[#FF5E1F] hover:bg-[#E54810] text-white shadow-[#FF5E1F]/20'
                                }
                            `}
                        >
                            Select
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
