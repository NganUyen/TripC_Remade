"use client"

import { useState } from 'react'
import { Calendar, Users, ChevronDown, ShieldCheck, MessageCircle } from 'lucide-react'

interface BookingPanelProps {
    price: string
    oldPrice: string
}

export function BookingPanel({ price, oldPrice }: BookingPanelProps) {
    const [guests, setGuests] = useState(2)

    return (
        <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-orange-500/5 p-6 space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <span className="text-sm text-slate-400 line-through">${oldPrice}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">${price}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">/ night</span>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    30% OFF
                </span>
            </div>

            {/* Date & Guests Selection */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden">
                <div className="flex divide-x divide-slate-200 dark:divide-slate-700">
                    <button className="flex-1 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Check-in</span>
                        <span className="font-bold text-slate-900 dark:text-white">Oct 14</span>
                    </button>
                    <button className="flex-1 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Check-out</span>
                        <span className="font-bold text-slate-900 dark:text-white">Oct 19</span>
                    </button>
                </div>
                <div className="relative">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Guests</span>
                            <span className="font-bold text-slate-900 dark:text-white">{guests} Guests</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 py-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                    <span className="underline decoration-dotted">5 nights x ${price}</span>
                    <span>${parseInt(price) * 5}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                    <span className="underline decoration-dotted">Service fee</span>
                    <span>$120</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>Total</span>
                    <span>${parseInt(price) * 5 + 120}</span>
                </div>
            </div>

            {/* CTAs */}
            <button className="w-full py-4 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-1">
                Book Now
            </button>

            <button className="w-full py-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Concierge
            </button>

            {/* Micro Trust */}
            <div className="flex items-center justify-center gap-4 text-slate-400 text-xs mt-4">
                <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure payment
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Instant confirmation</span>
            </div>
        </div>
    )
}
