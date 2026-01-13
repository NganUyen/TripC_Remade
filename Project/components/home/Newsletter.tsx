"use client"

import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

export function Newsletter() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-[3rem] overflow-hidden bg-slate-900 dark:bg-white/5 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl"
            >
                {/* Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5E1F] opacity-10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Trip Drops</h2>
                    <p className="text-slate-400 text-lg max-w-md">
                        Unlock exclusive deals with up to 50% off. Join 200,000+ travelers.
                    </p>
                </div>

                <div className="relative z-10 w-full md:w-auto max-w-md flex flex-col gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#FF5E1F] transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full h-14 pl-12 pr-32 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all"
                        />
                        <button className="absolute top-2 bottom-2 right-2 px-6 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
                            Subscribe
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 text-center md:text-left pl-4">No spam. Unsubscribe anytime.</p>
                </div>
            </motion.div>
        </section>
    )
}
