"use client"

import { useState } from 'react'
import { ListFilter, ChevronDown, Check } from 'lucide-react'

// Layout: Standard OTAs Sidebar (Booking.com style)
export function FlightFilterSidebar() {
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-8 lg:sticky lg:top-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Filters
                </h3>
                <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Reset
                </button>
            </div>

            {/* Stops */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Stops</h4>
                <div className="space-y-3">
                    {[
                        { label: 'Direct', price: '$450' },
                        { label: '1 Stop', price: '$390' },
                        { label: '2+ Stops', price: '$320' }
                    ].map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                <input type="checkbox" className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" />
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:bg-orange-500 absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 scale-0 peer-checked:scale-100" />
                                <div className="w-full h-full rounded-[5px] absolute inset-0 bg-transparent peer-checked:bg-orange-500 transition-colors" />
                            </div>
                            <div className="flex-1 flex justify-between text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                <span>{opt.label}</span>
                                <span className="text-slate-400 text-xs">{opt.price}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Departure Time */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Departure Time</h4>
                <div className="grid grid-cols-2 gap-2">
                    {['00-06', '06-12', '12-18', '18-24'].map((time) => (
                        <button key={time} className="border border-slate-200 dark:border-slate-800 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition-all bg-transparent">
                            {time}h
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Price Range</h4>
                <div className="px-1">
                    <input
                        type="range"
                        min="100"
                        max="2500"
                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex items-center justify-between mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span>$100</span>
                        <span>$2,500</span>
                    </div>
                </div>
            </div>

            {/* Airlines */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Airlines</h4>
                <div className="space-y-3">
                    {['American Airlines', 'Delta', 'United', 'Emirates', 'Qatar Airways'].map((airline, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                <input type="checkbox" className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" />
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:bg-orange-500 absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 scale-0 peer-checked:scale-100" />
                                <div className="w-full h-full rounded-[5px] absolute inset-0 bg-transparent peer-checked:bg-orange-500 transition-colors" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{airline}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}
