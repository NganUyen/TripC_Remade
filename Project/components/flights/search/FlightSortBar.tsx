"use client"

import { ArrowUpDown } from 'lucide-react'

interface FlightSortBarProps {
    sortBy: string
    onSortChange: (sort: string) => void
    count: number
}

export function FlightSortBar({ sortBy, onSortChange, count }: FlightSortBarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
                Found {count} flights
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    Premium Economy
                </span>
            </h3>

            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 no-scrollbar">
                <span className="text-sm font-medium text-slate-500 mr-1 whitespace-nowrap hidden sm:inline-block">Sort by:</span>

                {['price', 'duration', 'departure'].map((key) => (
                    <button
                        key={key}
                        onClick={() => onSortChange(key)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5
                            ${sortBy === key
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                        `}
                    >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {key === 'price' && sortBy === 'price' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                ))}
            </div>
        </div>
    )
}
