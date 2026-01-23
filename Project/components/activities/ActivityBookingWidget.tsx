"use client"

import { useState } from 'react'
import { Calendar as CalendarIcon, Users, ChevronDown } from 'lucide-react'
import type { ActivityItem } from './mockData'
import { motion } from 'framer-motion'

interface ActivityBookingWidgetProps {
    item: ActivityItem
}

export function MobileActivityBookingBar({ item }: { item: ActivityItem }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 lg:hidden pb-safe">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-bold uppercase">Total from</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-primary">${item.price}</span>
                        {item.oldPrice && (
                            <span className="text-sm text-slate-400 line-through">${item.oldPrice}</span>
                        )}
                    </div>
                </div>
                <button className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20">
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
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">

                    {/* Header */}
                    <div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Price</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">
                                ${(total).toLocaleString()}
                            </span>
                            {item.oldPrice && (
                                <span className="text-lg text-slate-400 line-through decoration-2">
                                    ${(item.oldPrice * guests).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Available for booking
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Select Date</label>
                            <button className="cursor-pointer w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 hover:border-primary transition-colors bg-slate-50 dark:bg-slate-800/50">
                                <CalendarIcon className="w-5 h-5 text-slate-500" />
                                <span className="font-medium text-slate-900 dark:text-white flex-1 text-left">
                                    {selectedDate || 'Choose a date'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Guest Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Guests</label>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-2">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    className="cursor-pointer w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                >
                                    -
                                </button>
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="font-bold text-slate-900 dark:text-white text-lg">{guests}</span>
                                    <span className="text-xs text-slate-500 uppercase font-bold">Adults</span>
                                </div>
                                <button
                                    onClick={() => setGuests(guests + 1)}
                                    className="cursor-pointer w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button className="cursor-pointer w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 transform transition-all active:scale-[0.98]">
                        Book Now
                    </button>

                    <p className="text-center text-xs text-slate-400 font-medium">
                        No payment required today. Free cancellation.
                    </p>
                </div>

                {/* Instant Confirmation Banner */}
                {item.instant && (
                    <div className="bg-slate-100 dark:bg-slate-800 py-3 px-6 text-center border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                            ⚡ Instant Confirmation
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
