"use client"

import { QrCode, Smartphone, CheckCircle2 } from 'lucide-react'

export function DownloadApp() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-slate-900 dark:bg-white/5 rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center relative shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5E1F] opacity-10 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

                {/* Content */}
                <div className="flex-1 p-8 md:p-16 z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
                        <Smartphone className="w-4 h-4" />
                        Get the App
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Travel smoother with <br />
                        <span className="text-[#FF5E1F]">TripC Mobile</span>
                    </h2>

                    <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
                        Get exclusive mobile-only deals, real-time flight alerts, and manage your trips on the go.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center md:justify-start">
                        {/* QR Code Card */}
                        <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center gap-3 w-40 transform hover:scale-105 transition-transform duration-300">
                            <QrCode className="w-24 h-24 text-slate-900" strokeWidth={1} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Scan to download</span>
                        </div>

                        {/* Benefits */}
                        <div className="flex flex-col gap-3 items-start">
                            {[
                                "Extra 10% OFF first app booking",
                                "Real-time trip notifications",
                                "Offline access to tickets"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phone Mockup (Visual Only) */}
                <div className="flex-1 h-[400px] md:h-[500px] w-full relative flex items-end justify-center z-10 overflow-hidden mt-8 md:mt-0">
                    <img
                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
                        alt="Mobile App"
                        className="h-[90%] w-auto object-contain drop-shadow-2xl transform translate-y-12 md:translate-y-8 hover:translate-y-4 transition-transform duration-700"
                    />
                </div>
            </div>
        </section>
    )
}
