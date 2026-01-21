"use client"

import { useEffect, Fragment } from "react"
import { useBookingStore } from "@/store/useBookingStore"
import { Check } from "lucide-react"

const STEPS = [
    "Passengers", "Seats", "Extras", "Insurance", "Review", "Payment"
]

export function BookingStepper() {
    const { step, setStep } = useBookingStore()

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [step])

    return (
        <div className="w-full py-2">
            {/* Desktop View (Pills) - Hidden on Mobile */}
            <div className="hidden lg:flex items-center gap-2 min-w-max overflow-x-auto no-scrollbar">
                {STEPS.map((label, index) => {
                    const stepNum = index + 1
                    const isActive = step === stepNum
                    const isCompleted = step > stepNum

                    return (
                        <div key={label} className="flex items-center">
                            <div
                                onClick={() => {
                                    if (isCompleted || isActive) {
                                        setStep(stepNum)
                                    }
                                }}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 relative z-10
                                    ${(isCompleted || isActive) ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : 'cursor-not-allowed opacity-50'}
                                    ${isActive
                                        ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white shadow-lg shadow-orange-500/20'
                                        : isCompleted
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                                    }
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                    ${isActive ? 'bg-white text-[#FF5E1F]' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}
                                `}>
                                    {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                                </div>
                                <span className="text-sm font-bold whitespace-nowrap">{label}</span>
                            </div>

                            {/* Connector Line */}
                            {index < STEPS.length - 1 && (
                                <div className={`w-6 h-[2px] mx-2 ${isCompleted ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Mobile View (Compact Numbers) - Hidden on Desktop */}
            <div className="flex lg:hidden items-center w-full px-4">
                {STEPS.map((label, index) => {
                    const stepNum = index + 1
                    const isActive = step === stepNum
                    const isCompleted = step > stepNum

                    return (
                        <Fragment key={label}>
                            {/* Step Circle */}
                            <div className="relative z-10">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                        ${isActive
                                            ? 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20 scale-110'
                                            : isCompleted
                                                ? 'bg-orange-50 text-[#FF5E1F] dark:bg-orange-500/10'
                                                : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'}
                                    `}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                </div>
                            </div>

                            {/* Connector (if not last) */}
                            {index < STEPS.length - 1 && (
                                <div className="flex-1 h-[2px] mx-2 relative rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className={`absolute inset-y-0 left-0 bg-[#FF5E1F]/30 h-full transition-all duration-500`}
                                        style={{ width: isCompleted ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}
