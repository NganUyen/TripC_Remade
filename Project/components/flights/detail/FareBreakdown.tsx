"use client"

import { Info } from "lucide-react"

interface FareBreakdownProps {
    price: {
        base: number
        tax: number
        total: number
    }
}

export function FareBreakdown({ price }: FareBreakdownProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Price Breakdown</h3>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Base Fare (1 Adult)</span>
                    <span className="font-bold text-slate-900 dark:text-white">${price.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        Taxes & Fees <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">${price.tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-500">Total</span>
                    <span className="text-3xl font-black text-[#FF5E1F]">${price.total.toFixed(2)}</span>
                </div>
            </div>

            <button className="w-full py-4 bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-lg">
                Continue to Book
            </button>
        </div>
    )
}
