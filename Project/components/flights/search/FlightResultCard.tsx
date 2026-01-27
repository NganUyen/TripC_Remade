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
        // 1. Outer Wrapper (The Mover)
        <div className="group transition-transform duration-300 transform-gpu mb-4">
            {/* 2. Inner Container (The Shell) */}
            <div className={`
                relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden
                border ${isSelected ? 'border-[#FF5E1F] bg-orange-50/10' : 'border-slate-100 dark:border-slate-800'} 
                shadow-sm hover:shadow-xl transition-all duration-300
            `}>
                {/* Best Value Badge - Clean & Minimal */}
                {flight.isBestValue && (
                    <div className="absolute top-0 right-0 bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-3xl z-10 shadow-sm">
                        Best Value
                    </div>
                )}

                <div className="p-6 grid grid-cols-1 lg:grid-cols-[1.5fr_2fr_1.2fr] gap-6 items-center">

                    {/* 1. Airline (Secondary Focus) */}
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${flight.airlineColor || 'bg-slate-500'}`}>
                            {flight.airlineCode || 'FL'}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{flight.airline}</h4>
                            <span className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{flight.flightNumber} • Boeing 737</span>
                        </div>
                    </div>

                    {/* 2. Timeline (Information Focus) */}
                    <div className="flex items-center justify-between gap-6 px-4">
                        {/* Departure */}
                        <div className="text-center min-w-[70px]">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{flight.departure.time}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{flight.departure.airport}</div>
                        </div>

                        {/* Duration Path */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest">{flight.duration}</div>
                            <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center">
                                {/* Simple dot or plane */}
                                <div className="bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-100 dark:border-slate-800">
                                    <Plane size={14} className="text-[#FF5E1F] rotate-90" />
                                </div>
                            </div>
                            <div className={`mt-2 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${flight.stops === 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center min-w-[70px]">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{flight.arrival.time}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{flight.arrival.airport}</div>
                        </div>
                    </div>

                    {/* 3. Price & Action (Primary Focus) */}
                    <div className="flex items-center justify-end gap-5 pl-4 border-l border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-end text-right">
                            <span className="text-xs text-slate-400 line-through font-medium">${flight.price + 45}</span>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-sm font-bold text-[#FF5E1F]">$</span>
                                <span className="text-3xl font-black text-[#FF5E1F] tracking-tight">{flight.price}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/pax</span>
                        </div>

                        <button
                            onClick={onSelect}
                            className={`
                                h-12 px-8 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2
                                ${isSelected
                                    ? 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-none cursor-default'
                                    : 'bg-[#FF5E1F] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                }
                            `}
                        >
                            {isSelected ? 'Selected' : 'Select'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
