"use client"

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
    title: string
    value: string | number
    change?: number
    icon: LucideIcon
    iconColor?: string
    iconBg?: string
    prefix?: string
    suffix?: string
}

export function StatCard({
    title,
    value,
    change,
    icon: Icon,
    iconColor = 'text-primary',
    iconBg = 'bg-primary/10',
    prefix = '',
    suffix = '',
}: StatCardProps) {
    const changeColor =
        change === undefined || change === 0
            ? 'text-slate-500'
            : change > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'

    const ChangeTrend =
        change === undefined || change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                        <ChangeTrend className="w-3 h-3" />
                        <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">{title}</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </div>
            </div>
        </motion.div>
    )
}
