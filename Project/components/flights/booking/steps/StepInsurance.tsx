"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { Shield, ShieldAlert, Check } from "lucide-react"

export function StepInsurance() {
    const { setStep, insurance, setInsurance } = useBookingStore()

    const plans = [
        { id: 'no', name: 'No Insurance', desc: 'Travel at your own risk without coverage', price: 0, tag: 'Free' },
        { id: 'basic', name: 'Basic Cover', desc: 'Essential protection for budget travelers', price: 19 },
        { id: 'standard', name: 'Standard Cover', desc: 'Comprehensive protection for peace of mind', price: 39, recommended: true },
        { id: 'premium', name: 'Premium Cover', desc: 'Maximum coverage for complete protection', price: 69, icon: true },
    ]

    return (
        <div className="space-y-8 animate-fadeIn">

            <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Travel Insurance</h3>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Protect your trip</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Travel insurance covers unexpected events like trip cancellations, medical emergencies, lost baggage, and flight delays. We recommend at least basic coverage for peace of mind.
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setInsurance(plan.id as any)}
                        className={`
                            relative flex flex-col cursor-pointer rounded-2xl border p-6 transition-all duration-300
                            ${insurance === plan.id
                                ? 'border-[#FF5E1F] bg-white dark:bg-slate-900 shadow-[0_0_0_2px_#FF5E1F]'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                            }
                        `}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-4 flex justify-center">
                            {plan.id === 'no' ? (
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-slate-400" />
                                </div>
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${plan.recommended ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-[#FF5E1F]'}`}>
                                    <Shield className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        <div className="text-center mb-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                            <p className="text-[10px] text-slate-500 min-h-[30px]">{plan.desc}</p>
                        </div>

                        <div className="text-center mt-auto mb-6">
                            {plan.price === 0 ? (
                                <span className="text-xl font-bold text-slate-900 dark:text-white">Free</span>
                            ) : (
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                                    <span className="text-[10px] text-slate-400">/person</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-6">
                            {['Trip cancellation', 'Medical expenses', 'Baggage loss'].map((feat, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">{feat}</span>
                                    {plan.id === 'no' ? <span className="text-slate-300">x</span> : <Check className="w-3 h-3 text-emerald-500" />}
                                </div>
                            ))}
                        </div>

                        <div className={`w-full py-2 rounded-lg text-xs font-bold text-center border transition-colors ${insurance === plan.id ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white' : 'border-slate-200 text-slate-500'}`}>
                            {insurance === plan.id ? 'Selected' : 'Select'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Back</button>
                <button
                    onClick={() => setStep(5)}
                    className="flex-1 ml-4 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.005] active:scale-[0.99]"
                >
                    Continue to Review
                </button>
            </div>
        </div>
    )
}
