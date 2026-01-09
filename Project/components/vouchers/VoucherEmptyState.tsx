"use client"

import React from 'react'
import { Ticket, SearchX } from 'lucide-react'

export function VoucherEmptyState() {
    return (
        <div className="w-full bg-white dark:bg-[#18181b] rounded-[2rem] p-12 md:p-24 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-100 dark:bg-zinc-800 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Ticket className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Vouchers Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                    We couldn't find any vouchers matching your filters. Try adjusting your search or check back later for new deals.
                </p>
                <button className="text-[#FF5E1F] font-bold text-sm hover:underline">
                    Clear all filters
                </button>
            </div>
        </div>
    )
}
