"use client"

import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

export function EventFilters() {
    const [priceRange, setPriceRange] = useState(50)

    return (
        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" /> Filters
                </h3>
                <button className="text-sm text-[#FF5E1F] font-bold hover:underline">Reset</button>
            </div>

            <div className="space-y-8">
                {/* Category Filter */}
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Category</h4>
                    <div className="space-y-2">
                        {['Music', 'Sports', 'Arts', 'Networking'].map((cat) => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-600 group-hover:border-[#FF5E1F] transition-colors relative flex items-center justify-center">
                                    {/* Fake checkbox logic for visual */}
                                </div>
                                <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Filter */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Price Range</h4>
                        <span className="text-[#FF5E1F] font-bold text-sm">${priceRange}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#FF5E1F]"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                        <span>$0</span>
                        <span>$500+</span>
                    </div>
                </div>

                {/* Date Filter */}
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Date</h4>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-full bg-[#FF5E1F] text-white text-xs font-bold shadow-md">Today</button>
                        <button className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">Tomorrow</button>
                        <button className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">This Week</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
