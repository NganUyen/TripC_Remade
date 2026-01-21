"use client"

import { Clock, Navigation } from "lucide-react"

interface FlightTimelineProps {
    data: {
        airline: string
        flightValues: string
        duration: string
        departure: {
            time: string
            airport: string
            airportCode: string
            terminal: string
        }
        arrival: {
            time: string
            airport: string
            airportCode: string
            terminal: string
        }
    }
}

export function FlightTimeline({ data }: FlightTimelineProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                    VS
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{data.airline}</h3>
                    <p className="text-xs text-slate-500">{data.flightValues} • {data.duration}</p>
                </div>
            </div>

            <div className="relative pl-4 space-y-8">
                {/* Connector Line */}
                <div className="absolute left-[23px] top-3 bottom-3 w-[2px] bg-slate-100 dark:bg-slate-800"></div>

                {/* Departure */}
                <div className="relative flex gap-6">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900 relative z-10 mt-1"></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{data.departure.time}</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{data.departure.airportCode}</div>
                        <div className="text-sm text-slate-500">{data.departure.airport}</div>
                        <div className="text-xs text-slate-400 mt-1">{data.departure.terminal}</div>
                    </div>
                </div>

                {/* Duration/Flight Info */}
                <div className="relative flex gap-6 py-2">
                    <div className="w-4 flex justify-center sticky z-10">
                        <PlaneIcon className="w-4 h-4 text-slate-300 rotate-180" />
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {data.duration} Flight
                    </div>
                </div>

                {/* Arrival */}
                <div className="relative flex gap-6">
                    <div className="w-4 h-4 rounded-full border-2 border-[#FF5E1F] bg-white dark:bg-slate-900 relative z-10 mt-1"></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{data.arrival.time}</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{data.arrival.airportCode}</div>
                        <div className="text-sm text-slate-500">{data.arrival.airport}</div>
                        <div className="text-xs text-slate-400 mt-1">{data.arrival.terminal}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PlaneIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12h20" />
            <path d="M19 12l-7-7" />
            <path d="M19 12l-7 7" />
        </svg>
    )
}
