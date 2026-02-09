"use client"

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { DashboardStats } from '@/lib/shop/types'

interface ProfitChartProps {
    stats: DashboardStats['chart']
}

export function ProfitChart({ stats }: ProfitChartProps) {
    // Transform data for Recharts
    const data = useMemo(() => {
        if (!stats || !stats.labels || stats.labels.length === 0) return []
        return stats.labels.map((label, index) => ({
            name: label,
            revenue: (stats.revenue[index] || 0) / 100, // Convert cents to dollars
            orders: stats.orders[index] || 0
        }))
    }, [stats])

    if (!stats || !stats.labels || stats.labels.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center h-[350px] flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">No chart data available for this period.</p>
            </div>
        )
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 ring-1 ring-black/5 min-w-[200px]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Revenue</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value as number)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orders</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {payload[1]?.value}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue & Orders</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Performance trends over time</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-300">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-600 dark:text-slate-300">Orders</span>
                    </div>
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => `$${value}`}
                            dx={0}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            hide
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
