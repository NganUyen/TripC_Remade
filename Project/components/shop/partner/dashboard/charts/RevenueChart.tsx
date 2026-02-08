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
    TooltipProps
} from 'recharts'
import { DashboardStats } from '@/lib/shop/types'

interface RevenueChartProps {
    stats: DashboardStats['chart']
}

export function RevenueChart({ stats }: RevenueChartProps) {
    if (!stats || !stats.labels || stats.labels.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">No chart data available for this period.</p>
            </div>
        )
    }

    // Transform data for Recharts
    const data = useMemo(() => {
        return stats.labels.map((label, index) => ({
            name: label,
            revenue: (stats.revenue[index] || 0) / 100, // Convert cents to dollars
            orders: stats.orders[index] || 0
        }))
    }, [stats])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg ring-1 ring-black/5">
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Revenue: <span className="font-medium text-slate-700 dark:text-slate-200">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value as number)}
                            </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Orders: <span className="font-medium text-slate-700 dark:text-slate-200">
                                {payload[1]?.value}
                            </span>
                        </p>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            hide
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
