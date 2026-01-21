"use client"

import { useBookingStore } from "@/store/useBookingStore"

export function StepReview() {
    const { setStep, passengers } = useBookingStore()

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review Booking</h2>
                <p className="text-slate-500 dark:text-slate-400">Please review all details before payment.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4">Passengers</h3>
                {passengers.map(p => (
                    <div key={p.id} className="text-sm border-b py-2 last:border-0">{p.firstName} {p.lastName}</div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(4)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
                <button
                    onClick={() => setStep(6)}
                    className="px-8 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-full text-white font-bold text-lg shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    )
}
