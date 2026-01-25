"use client"

import { motion } from 'framer-motion'
import { fadeInUp } from './shared'

function TcentIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 6v12M8.5 8.5h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}

export interface BalanceHeaderProps {
    tcent_balance: number
    membership_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
    tcent_pending: number
}

export function BalanceHeader({ tcent_balance, membership_tier, tcent_pending }: BalanceHeaderProps) {
    const tierMultiplier = membership_tier === 'PLATINUM' ? 2.0 :
        membership_tier === 'GOLD' ? 1.5 :
            membership_tier === 'SILVER' ? 1.2 : 1.0

    return (
        <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-[2rem] p-8 mb-6 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-700 shadow-xl shadow-orange-500/20">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse-slow" />

            <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    <TcentIcon className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-wide uppercase">Available Balance</span>
                </div>
                <h1 className="text-5xl font-black mb-4 tracking-tight">{tcent_balance?.toLocaleString() ?? 0}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
                        {membership_tier} Member • {tierMultiplier}x
                    </span>
                    {tcent_pending > 0 && (
                        <span className="text-xs font-medium opacity-80">
                            {tcent_pending} Pending
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
