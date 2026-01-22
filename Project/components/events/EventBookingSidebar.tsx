"use client"

import { useState } from 'react'
import { ChevronDown, Check, Ticket, AlertCircle } from 'lucide-react'

export function EventBookingSidebar() {
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)

    const basePrice = 145
    const totalPrice = (adults + children) * basePrice

    // Warning logic: Child > 0 but Adult == 0
    const showWarning = children > 0 && adults === 0

    return (
        <aside className="hidden lg:block w-full sticky top-24 z-30">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                {/* Price Header */}
                <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">${totalPrice}</span>
                    <span className="text-lg text-slate-500 font-medium mb-1">total</span>
                    <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        Selling Fast
                    </div>
                </div>

                {/* Inputs Boarding Pass Style */}
                <div className="space-y-3 mb-6">
                    {/* Date/Session Selection */}
                    <button className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-[#FF5E1F] transition-colors group text-left">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">Aug 12, 2026 (Day 1)</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-[#FF5E1F] transition-colors" />
                    </button>

                    {/* Quantity - Adults */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adults (18+)</p>
                                <p className="font-bold text-slate-900 dark:text-white">${basePrice}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAdults(Math.max(0, adults - 1))}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors"
                                >-</button>
                                <span className="font-bold text-slate-900 dark:text-white w-4 text-center">{adults}</span>
                                <button
                                    onClick={() => setAdults(adults + 1)}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Quantity - Children */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Children</p>
                                <p className="font-bold text-slate-900 dark:text-white">${basePrice}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors"
                                >-</button>
                                <span className="font-bold text-slate-900 dark:text-white w-4 text-center">{children}</span>
                                <button
                                    onClick={() => setChildren(children + 1)}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Validation Warning */}
                    {showWarning && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Children must be accompanied by at least 1 adult.</p>
                        </div>
                    )}
                </div>

                {/* Ticket Tier Selection */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ticket Tier</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        <button className="flex-shrink-0 px-4 py-2 rounded-full border border-[#FF5E1F] bg-orange-50 dark:bg-orange-900/20 text-[#FF5E1F] dark:text-orange-400 text-sm font-bold truncate">
                            General Admission
                        </button>
                        <button className="flex-shrink-0 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold truncate hover:border-[#FF5E1F] transition-colors">
                            VIP Access
                        </button>
                    </div>
                </div>

                {/* Submit Action */}
                <button
                    disabled={showWarning || (adults === 0 && children === 0)}
                    className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-[#FF5E1F] disabled:cursor-not-allowed"
                >
                    <Ticket className="w-5 h-5" />
                    Get Tickets
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                    <Check className="w-3 h-3 text-green-500" /> Instant Digital Delivery
                </div>

            </div>
        </aside>
    )
}

export function EventMobileBookingBar() {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 lg:hidden flex items-center justify-between gap-4 pb-8">
            <div>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">$145</span>
                    <span className="text-sm text-slate-500 mb-1"> / ticket</span>
                </div>
                <p className="text-xs text-orange-600 font-bold">Aug 12 • GA</p>
            </div>
            <button className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20">
                Get Tickets
            </button>
        </div>
    )
}
