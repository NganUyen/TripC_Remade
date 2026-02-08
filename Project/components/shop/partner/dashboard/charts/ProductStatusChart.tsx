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
import { Package } from 'lucide-react'
import { PartnerProduct } from '@/lib/shop/types'

interface ProductStatusChartProps {
    products: PartnerProduct[]
}

const COLORS = {
    active: '#10b981',   // emerald-500
    draft: '#f59e0b',    // amber-500
    archived: '#94a3b8', // slate-400
}

export function ProductStatusChart({ products }: ProductStatusChartProps) {
    const data = useMemo(() => {
        const counts = {
            active: 0,
            draft: 0,
            archived: 0
        }

        products.forEach(p => {
            if (p.status in counts) {
                counts[p.status as keyof typeof counts]++
            }
        })

        return [
            { name: 'Active', value: counts.active, color: COLORS.active },
            { name: 'Draft', value: counts.draft, color: COLORS.draft },
            { name: 'Archived', value: counts.archived, color: COLORS.archived },
        ].filter(item => item.value > 0)
    }, [products])

    if (products.length === 0) return null

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-purple-600" />
                Product Status
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
                            formatter={(value: any) => [`${value} Products`, '']}
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
                        {products.length}
                    </span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
                </div>
            </div>
        </div>
    )
}
