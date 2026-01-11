"use client"

import { motion } from 'framer-motion'
import { Wallet, CreditCard, ChevronRight, Award, Zap } from 'lucide-react'

export function WalletSection() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Wallet Card - Virtual Visa Style */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative h-64 rounded-[2.5rem] p-8 overflow-hidden bg-gradient-to-br from-[#FF5E1F] to-orange-400 shadow-2xl shadow-orange-500/20 text-white flex flex-col justify-between"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wide">T-Wallet</span>
                        </div>
                        <CreditCard className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-sm font-medium text-orange-50">Available Balance</p>
                </div>

                <div className="relative z-10">
                    <h2 className="text-5xl font-black mb-1">0 <span className="text-2xl font-bold opacity-80">T-Cent</span></h2>
                    <p className="text-sm text-orange-100 font-medium font-mono">**** **** **** 8842</p>
                </div>
            </motion.div>

            {/* Membership Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative h-64 rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between"
            >
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Gold Member</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier Status</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Progress to Platinum</span>
                        <span>450 / 1000 pts</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Priority Support
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> 5% Off Hotels
                        </span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
