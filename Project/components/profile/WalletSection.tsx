"use client"


import { motion } from 'framer-motion'
import { Wallet, CreditCard, ChevronRight, Award, Zap } from 'lucide-react'

const TIER_CONFIGS = [
    { name: 'BRONZE', spend: 0, orders: 3 },
    { name: 'SILVER', spend: 500, orders: 5 },
    { name: 'GOLD', spend: 2000, orders: 10 },
    { name: 'PLATINUM', spend: 5000, orders: 15 },
]

interface WalletSectionProps {
    profile?: {
        tcent_balance: number
        membership_tier: string
        lifetime_spend?: number
        total_orders_completed?: number
    } | null
}

export function WalletSection({ profile }: WalletSectionProps) {
    const tier = profile?.membership_tier || 'BRONZE'
    const balance = profile?.tcent_balance || 0
    const spend = Number(profile?.lifetime_spend || 0)
    const orders = profile?.total_orders_completed || 0

    const currentTierIndex = TIER_CONFIGS.findIndex(t => t.name === tier)
    // If not found (e.g. custom tier), default to Bronze logic
    const safeIndex = currentTierIndex === -1 ? 0 : currentTierIndex
    const nextTier = TIER_CONFIGS[safeIndex + 1]

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
                    <h2 className="text-5xl font-black mb-1">
                        {balance.toLocaleString()} <span className="text-2xl font-bold opacity-80">T-Cent</span>
                    </h2>
                    <p className="text-sm text-orange-100 font-medium font-mono">**** **** **** 8842</p>
                </div>
            </motion.div>

            {/* Membership Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative h-64 rounded-[2.5rem] p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                                {tier.toLowerCase()} Member
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier Status</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                    {nextTier ? (
                        <div className="space-y-4">
                            {/* Spend Progress */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Lifetime Spend</span>
                                    <span>${spend.toLocaleString()} / ${nextTier.spend.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((spend / nextTier.spend) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Orders Progress */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Orders Completed</span>
                                    <span>{orders} / {nextTier.orders}</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((orders / nextTier.orders) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.7 }}
                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                    />
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 text-center font-medium">
                                Reach <span className="text-slate-900 dark:text-white font-bold">{nextTier.name}</span> by meeting both goals!
                            </p>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl">
                            <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                                You have reached the highest tier!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </section>
    )
}
