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
    BarChart,
    Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DollarSign, Ticket } from 'lucide-react'

interface ChartData {
    date: string
    revenue: number
    bookings: number
}

interface DashboardChartsProps {
    data: ChartData[]
    days: number
}

export function DashboardCharts({ data, days }: DashboardChartsProps) {

    // Format date for axis (e.g., "Jan 12")
    const formattedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }))
    }, [data])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Chart - Takes up 4 columns on large screens */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Revenue Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="formattedDate"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Chart - Takes up 3 columns on large screens */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-emerald-500" />
                        Bookings Trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedData}>
                                <XAxis
                                    dataKey="formattedDate"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="bookings"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
