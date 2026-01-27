"use client"

import { ShieldCheck, RefreshCw, Lock, HeadphonesIcon } from 'lucide-react'

export function TrustBenefits() {
    const benefits = [
        { icon: ShieldCheck, title: "Verified Providers", desc: "Quality vetted partners" },
        { icon: RefreshCw, title: "Flexible Cancellation", desc: "No-stress booking" },
        { icon: Lock, title: "Secure Payments", desc: "Bank-level encryption" },
        { icon: HeadphonesIcon, title: "24/7 Concierge", desc: "Always here for you" },
    ]

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                            <benefit.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{benefit.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
