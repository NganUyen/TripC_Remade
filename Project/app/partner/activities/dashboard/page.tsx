
"use client"

import { useEffect, useState } from 'react'
import { DollarSign, Ticket, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DashboardCharts } from '@/components/partner/DashboardCharts'

export default function PartnerDashboard() {
    const [days, setDays] = useState(7)
    const [stats, setStats] = useState({
        revenue: 0,
        totalBookings: 0,
        averageRating: 0,
        activeListings: 0,
        chartData: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                const res = await fetch(`/api/partner/stats?days=${days}`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [days])

    if (loading && !stats.revenue) return <div>Loading dashboard...</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overviews</h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Time Range:</span>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 3 Months</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeListings}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating}</div>
                    </CardContent>
                </Card>
            </div>

            <DashboardCharts data={stats.chartData || []} days={days} />
        </div>
    )
}
