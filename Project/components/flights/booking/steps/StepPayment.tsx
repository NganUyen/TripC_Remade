"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { FlightDetailsSummary } from "../FlightDetailsSummary"
import { CreditCard, Tag, QrCode, Clock, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function StepPayment() {
    const { setStep, toggleTcent, useTcent, paymentMethod, setPaymentMethod } = useBookingStore()
    const router = useRouter()

    const handlePayment = () => {
        // Validation (Simulated)
        if (!paymentMethod) {
            toast.error("Please select a payment method")
            return
        }

        // Simulate payment selection processing
        const promise = new Promise((resolve) => setTimeout(resolve, 1500))

        toast.promise(promise, {
            loading: 'Processing selection...',
            success: (data) => {
                // If we have a booking ID in the URL, go to checkout
                const params = new URLSearchParams(window.location.search);
                const exBookingId = params.get('bookingId');

                if (exBookingId) {
                    router.push(`/checkout?bookingId=${exBookingId}`)
                } else {
                    // Fallback to home if no booking ID found (shouldn't happen in real flow)
                    router.push('/')
                }
                return 'Redirecting to secure checkout...'
            },
            error: 'Failed to process payment selection',
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <FlightDetailsSummary />

            <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payment Method</h3>
            </div>

            {/* Promo Code */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Promo Code</h4>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Enter code"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FF5E1F] transition-colors"
                    />
                    <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors">
                        Apply
                    </button>
                </div>
            </div>

            {/* TCent Toggle */}
            <div className={`bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] p-6 border transition-all ${useTcent ? 'border-[#FF5E1F]' : 'border-amber-100 dark:border-amber-800/30'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF5E1F] rounded-lg text-white">
                            <span className="font-black text-xs">TC</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Use Tcent</h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">1,144 Available</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={useTcent} onChange={toggleTcent} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5E1F]"></div>
                    </label>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
                <label className={`cursor-pointer block bg-white dark:bg-slate-900 rounded-[2rem] p-6 border transition-all ${paymentMethod === 'payos' ? 'border-[#FF5E1F] ring-1 ring-[#FF5E1F] shadow-lg shadow-orange-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-4">
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'payos'} onChange={() => setPaymentMethod('payos')} />
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'payos' ? 'border-[#FF5E1F] bg-[#FF5E1F]' : 'border-slate-300'}`}>
                            {paymentMethod === 'payos' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white">Pay with PayOS</div>
                            <div className="text-xs text-slate-500">QR Code, MoMo, ZaloPay, Bank Transfer</div>
                        </div>
                    </div>
                    {paymentMethod === 'payos' && (
                        <div className="mt-4 pl-12 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                You will be redirected to PayOS gateway to complete payment securely.
                            </div>
                        </div>
                    )}
                </label>

                <label className={`cursor-pointer block bg-white dark:bg-slate-900 rounded-[2rem] p-6 border transition-all ${paymentMethod === 'later' ? 'border-[#FF5E1F] ring-1 ring-[#FF5E1F] shadow-lg shadow-orange-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-4">
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'later'} onChange={() => setPaymentMethod('later')} />
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'later' ? 'border-[#FF5E1F] bg-[#FF5E1F]' : 'border-slate-300'}`}>
                            {paymentMethod === 'later' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white">Pay Later</div>
                            <div className="text-xs text-slate-500">Pay at counter or via bank transfer</div>
                        </div>
                    </div>
                </label>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(4)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Back</button>
                <button
                    onClick={handlePayment}
                    className="flex-1 ml-4 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    Pay $1,144
                </button>
            </div>
        </div>
    )
}
