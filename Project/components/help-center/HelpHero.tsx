"use client"

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

interface HelpHeroProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export function HelpHero({ searchQuery, setSearchQuery }: HelpHeroProps) {
    const suggestions = ['Refunds', 'My Bookings', 'Wallet', 'Rewards', 'Account', 'Technical']

    return (
        <section className="relative min-h-[500px] w-full flex flex-col items-center justify-center p-4 pt-24 pb-12">
            {/* Background & Mask */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop"
                    alt="Customer Support"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center mt-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md tracking-tight"
                >
                    Help Center
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg text-white/90 max-w-xl font-medium mb-10"
                >
                    Get support for bookings, payments, rewards, and your account.
                </motion.p>

                {/* Search Console */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full relative group"
                >
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics like refund, voucher, change dates..."
                        className="w-full h-16 pl-16 pr-6 rounded-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-2xl text-lg outline-none focus:ring-4 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F] transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                    />
                </motion.div>

                {/* Quick Chips */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6 flex flex-wrap justify-center gap-2"
                >
                    {suggestions.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setSearchQuery(item)}
                            className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/10 text-white text-sm font-medium transition-colors"
                        >
                            {item}
                        </button>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
