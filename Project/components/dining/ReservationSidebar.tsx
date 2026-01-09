"use client"

import React, { useState } from 'react'
import { Calendar, Clock, Users, ChevronDown } from 'lucide-react'

export function ReservationSidebar() {
    const [guests, setGuests] = useState(2)

    return (
        <div className="sticky top-24 bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Reserve a Table</h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5E1F]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#FF5E1F]">Live</span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-[#FF5E1F] transition-colors group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F]" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Oct 24</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-[#FF5E1F] transition-colors group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Clock className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F]" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">19:30</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                </div>

                {/* Guests */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{guests} Guests</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold hover:bg-[#FF5E1F] hover:text-white">-</button>
                        <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold hover:bg-[#FF5E1F] hover:text-white">+</button>
                    </div>
                </div>
            </div>

            <button className="w-full bg-[#FF5E1F] hover:bg-[#e04f18] text-white font-bold py-4 rounded-full shadow-lg shadow-orange-500/20 transition-all active:scale-95 mb-3 flex items-center justify-center gap-2 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                <span className="relative">Confirm Booking</span>
            </button>

            <button className="w-full text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white transition-colors">
            For groups > 10, click here
            </button>
        </div>
    )
}
