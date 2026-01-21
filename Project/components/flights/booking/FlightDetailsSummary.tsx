"use client"

import { Plane, ArrowRight } from "lucide-react"

export function FlightDetailsSummary() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <Plane className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Flight Details</h3>
                <span className="px-3 py-1 rounded-full bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-wider">Round Trip</span>
            </div>

            <div className="space-y-6">
                {/* Outbound */}
                <div className="relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Outbound Flight</div>
                            <div className="flex items-end gap-2 text-slate-900 dark:text-white">
                                <span className="text-2xl font-black">08:30</span>
                                <span className="text-sm font-bold mb-1">JFK</span>
                            </div>
                            <div className="text-xs text-slate-500">Thu, Jan 22</div>
                        </div>

                        <div className="flex-1 px-8 text-center mt-3">
                            <div className="text-xs text-slate-400 mb-1">6h 15m</div>
                            <div className="h-[2px] bg-slate-100 dark:bg-slate-800 relative w-full">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Direct</div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 opacity-0">Arrival</div>
                            <div className="flex items-end gap-2 text-slate-900 dark:text-white justify-end">
                                <span className="text-2xl font-black">16:15</span>
                                <span className="text-sm font-bold mb-1">LAX</span>
                            </div>
                            <div className="text-xs text-slate-500">Thu, Jan 22</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <img src="https://img.logo.dev/delta.com?token=pk_mXa234" alt="Airline" className="w-4 h-4 rounded-full" />
                        <span>United Airlines</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>UA6538</span>
                    </div>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800"></div>

                {/* Return */}
                <div className="relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Return Flight</div>
                            <div className="flex items-end gap-2 text-slate-900 dark:text-white">
                                <span className="text-2xl font-black">08:30</span>
                                <span className="text-sm font-bold mb-1">LAX</span>
                            </div>
                            <div className="text-xs text-slate-500">Sat, Jan 31</div>
                        </div>

                        <div className="flex-1 px-8 text-center mt-3">
                            <div className="text-xs text-slate-400 mb-1">5h 45m</div>
                            <div className="h-[2px] bg-slate-100 dark:bg-slate-800 relative w-full">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Direct</div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 opacity-0">Arrival</div>
                            <div className="flex items-end gap-2 text-slate-900 dark:text-white justify-end">
                                <span className="text-2xl font-black">10:15</span>
                                <span className="text-sm font-bold mb-1">JFK</span>
                            </div>
                            <div className="text-xs text-slate-500">Sat, Jan 31</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <img src="https://img.logo.dev/delta.com?token=pk_mXa234" alt="Airline" className="w-4 h-4 rounded-full" />
                        <span>United Airlines</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>UA5507</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
