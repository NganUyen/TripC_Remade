"use client"

import { useState } from 'react'
import { Calendar, Users, ChevronDown, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export function BookingSidebar() {
    return (
        <aside className="hidden lg:block w-full sticky top-24 z-30">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                {/* Price Header */}
                <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">$840</span>
                    <span className="text-lg text-slate-500 font-medium mb-1">/ night</span>
                    <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        -15% Today
                    </div>
                </div>

                {/* Inputs Boarding Pass Style */}
                <div className="space-y-3 mb-6">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 p-1 rounded-[1.5rem]">
                        <button className="bg-white dark:bg-slate-900 p-3 rounded-l-[1.2rem] rounded-r-lg hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors text-left group">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in</p>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">May 12</p>
                        </button>
                        <button className="bg-white dark:bg-slate-900 p-3 rounded-r-[1.2rem] rounded-l-lg hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors text-left group">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Check-out</p>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">May 15</p>
                        </button>
                    </div>

                    {/* Guests */}
                    <button className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-orange-500 transition-colors group text-left">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                            <p className="font-bold text-slate-900 dark:text-white">2 Adults, 1 Room</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </button>
                </div>

                {/* Room Selection */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Room Type</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        <button className="flex-shrink-0 px-4 py-2 rounded-full border border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-bold truncate">
                            Sunset View
                        </button>
                        <button className="flex-shrink-0 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold truncate hover:border-orange-500 transition-colors">
                            Ocean Front
                        </button>
                    </div>
                </div>

                {/* Submit Action */}
                <button className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4">
                    Reserve Sanctuary
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                    <Check className="w-3 h-3 text-green-500" /> Free cancellation before May 10
                </div>

            </div>
        </aside>
    )
}

export function MobileBookingBar() {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 lg:hidden flex items-center justify-between gap-4 pb-8">
            <div>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">$840</span>
                    <span className="text-sm text-slate-500 mb-1">/ night</span>
                </div>
                <p className="text-xs text-green-600 font-bold">May 12 - 15</p>
            </div>
            <button className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20">
                Reserve
            </button>
        </div>
    )
}
