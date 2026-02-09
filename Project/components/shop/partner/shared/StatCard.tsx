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
    iconColor = 'text-slate-900',
    iconBg = 'bg-slate-100',
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
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
                <div className={`p-2 rounded-lg ${iconBg} bg-opacity-50 dark:bg-opacity-20`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>

            <div className="flex items-end justify-between gap-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </div>

                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        <ChangeTrend className="w-3 h-3" />
                        <span>{Math.abs(change).toFixed(1)}%</span>
                        <span className="text-slate-400 font-normal ml-1 hidden sm:inline">vs last period</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
