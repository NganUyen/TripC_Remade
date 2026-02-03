"use client"

import { useState } from 'react'
import { Calendar as CalendarIcon, Users, ChevronDown, Check } from 'lucide-react'
import type { ActivityItem } from './mockData'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface ActivityBookingWidgetProps {
    item: ActivityItem
}

export function MobileActivityBookingBar({ item }: { item: ActivityItem }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-3 lg:hidden pb-safe transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total from</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[#FF5E1F]">${item.price}</span>
                        {item.oldPrice && (
                            <span className="text-xs text-slate-400 line-through">${item.oldPrice}</span>
                        )}
                    </div>
                </div>
                <button className="flex-1 h-11 rounded-xl bg-[#FF5E1F] hover:bg-[#FF5E1F]/90 text-white font-bold text-sm shadow-lg shadow-[#FF5E1F]/20 active:scale-[0.98] transition-all">
                    Book Now
                </button>
            </div>
        </div>
    )
}

export function ActivityBookingWidget({ item }: ActivityBookingWidgetProps) {
    const [guests, setGuests] = useState(1)
    const [selectedDate, setSelectedDate] = useState<string>('')

    const total = item.price * guests

    return (
        <div className="sticky top-24">
            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-800 overflow-hidden transition-all duration-300">
                <div className="p-6 space-y-5">

                    {/* Header */}
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                ${(total).toLocaleString()}
                            </span>
                            {item.oldPrice && (
                                <span className="text-sm text-slate-400 line-through font-medium">
                                    ${(item.oldPrice * guests).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Available for booking
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Date Selection */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Select Date</label>
                            <button className="cursor-pointer w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 hover:border-[#FF5E1F]/50 transition-all bg-white dark:bg-slate-800/50 group">
                                <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F] transition-colors" />
                                <span className="font-bold text-sm text-slate-900 dark:text-white flex-1 text-left">
                                    {selectedDate || 'Choose a date'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Guest Selection */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Guests</label>
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    className="cursor-pointer w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
                                >
                                    -
                                </button>
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="font-bold text-slate-900 dark:text-white text-base">{guests}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Adults</span>
                                </div>
                                <button
                                    onClick={() => setGuests(guests + 1)}
                                    className="cursor-pointer w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button className="cursor-pointer w-full h-12 bg-[#FF5E1F] hover:bg-[#FF5E1F]/90 text-white rounded-xl font-bold text-base shadow-lg shadow-[#FF5E1F]/20 hover:shadow-xl hover:shadow-[#FF5E1F]/30 hover:-translate-y-0.5 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <span>Book Now</span>
                        <Check className="w-4 h-4" />
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                        Free cancellation • No payment today
                    </p>
                </div>

                {/* Instant Confirmation Banner */}
                {item.instant && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 py-2.5 px-6 text-center border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            ⚡ Instant Confirmation
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
