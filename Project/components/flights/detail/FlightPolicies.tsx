"use client"

import { Luggage, RefreshCw, XCircle } from "lucide-react"

export function FlightPolicies() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Policies & Baggage</h3>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Luggage className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cabin Baggage</h4>
                        <p className="text-sm text-slate-500 mt-1">1 x 7kg cabin bag included.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Change Policy</h4>
                        <p className="text-sm text-slate-500 mt-1">Date changes allowed with fee of $50 + fare difference.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cancellation</h4>
                        <p className="text-sm text-slate-500 mt-1">Non-refundable. Credit shell only.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
