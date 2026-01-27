"use client"

import { Plane } from "lucide-react"

interface FlightSummaryCardProps {
    data: {
        from: string
        to: string
        date: string
        passengers: number
        class: string
    }
}

export function FlightSummaryCard({ data }: FlightSummaryCardProps) {
    return (
        // 1. Outer Wrapper (The Mover)
        <div className="group transition-transform duration-300 transform-gpu">
            {/* 2. Inner Container (The Shell) */}
            <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-shadow hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* 3. Content */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF5E1F]/10 flex items-center justify-center">
                        <Plane className="w-6 h-6 text-[#FF5E1F]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {data.from} <span className="text-slate-400">→</span> {data.to}
                        </h1>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                            <span className="font-medium">{data.date}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-medium">{data.passengers} Passenger(s)</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-medium">{data.class}</span>
                        </div>
                    </div>
                </div>

                <button className="px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Change Search
                </button>
            </div>
        </div>
    )
}
