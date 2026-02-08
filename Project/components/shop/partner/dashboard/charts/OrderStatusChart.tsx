"use client"

import { useMemo } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import { ShoppingCart } from 'lucide-react'
import { PartnerOrder } from '@/lib/shop/types'

interface OrderStatusChartProps {
    orders: PartnerOrder[]
}

const COLORS: Record<string, string> = {
    pending: '#f59e0b',    // amber-500
    confirmed: '#06b6d4',  // cyan-500
    processing: '#3b82f6', // blue-500
    shipped: '#a855f7',    // purple-500
    delivered: '#10b981',  // emerald-500
    cancelled: '#ef4444',  // red-500
}

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
    const data = useMemo(() => {
        const counts: Record<string, number> = {}

        orders.forEach(o => {
            counts[o.status] = (counts[o.status] || 0) + 1
        })

        return Object.entries(counts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: COLORS[status] || '#94a3b8'
        })).sort((a, b) => b.value - a.value)
    }, [orders])

    if (orders.length === 0) return null

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Order Status
            </h3>

            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" className="dark:stroke-slate-900" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}
                            formatter={(value: any) => [`${value} Orders`, '']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {orders.length}
                    </span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
                </div>
            </div>
        </div>
    )
}
