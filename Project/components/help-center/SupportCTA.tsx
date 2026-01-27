"use client"

import { motion } from 'framer-motion'
import { LifeBuoy, ArrowRight } from 'lucide-react'

export function SupportCTA() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5E1F] opacity-10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 dark:bg-white/10 text-white text-xs font-bold mb-6 border border-white/10">
                        <LifeBuoy className="w-4 h-4 text-[#FF5E1F]" />
                        <span>Still need help?</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Can't find what you're looking for?</h2>
                    <p className="text-slate-400 text-lg max-w-lg">
                        Our specialized support team is available 24/7 to assist you with any issues.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        Create a Ticket
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2">
                        Track my tickets <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </section>
    )
}
