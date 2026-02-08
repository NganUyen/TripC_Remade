"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Calendar,
    Clock,
    Star,
    MapPin,
    Users
} from 'lucide-react'
import { useSupabaseClient } from '@/lib/supabase'

interface PerformanceData {
    totalTrips: number
    completedTrips: number
    cancelledTrips: number
    avgRating: number
    onTimeRate: number
    avgOccupancy: number
    topRoutes: Array<{
        origin: string
        destination: string
        count: number
    }>
}

export function Performance() {
    const supabase = useSupabaseClient()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<PerformanceData>({
        totalTrips: 0,
        completedTrips: 0,
        cancelledTrips: 0,
        avgRating: 0,
        onTimeRate: 0,
        avgOccupancy: 0,
        topRoutes: []
    })
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

    useEffect(() => {
        fetchPerformanceData()
    }, [period])

    const fetchPerformanceData = async () => {
        try {
            setLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get user's providers
            const { data: providers } = await supabase
                .from('transport_providers')
                .select('id')
                .eq('owner_id', user.id)

            if (!providers || providers.length === 0) {
                setLoading(false)
                return
            }

            const providerIds = providers.map(p => p.id)

            // Get date range
            const now = new Date()
            let startDate = new Date()
            if (period === 'week') {
                startDate.setDate(now.getDate() - 7)
            } else if (period === 'month') {
                startDate.setMonth(now.getMonth() - 1)
            } else {
                startDate.setFullYear(now.getFullYear() - 1)
            }

            // Fetch bookings restricted to provider's routes
            // Note: Assuming bookings for transport have a route_id that maps to transport_routes
            const { data: routes } = await supabase
                .from('transport_routes')
                .select('id, origin, destination')
                .in('provider_id', providerIds)

            if (!routes || routes.length === 0) {
                setLoading(false)
                return
            }

            const routeIds = routes.map(r => r.id)

            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    route_id,
                    transport_routes!inner (
                        origin,
                        destination,
                        seats_available,
                        provider_id
                    )
                `)
                .in('transport_routes.provider_id', providerIds)
                .gte('created_at', startDate.toISOString())

            // Fetch reviews restricted to provider
            const { data: reviews, error: reviewsError } = await supabase
                .from('transport_reviews')
                .select('rating')
                .in('provider_id', providerIds)
                .gte('created_at', startDate.toISOString())

            if (bookingsError || reviewsError) {
                console.error('Error fetching data:', bookingsError || reviewsError)
            } else {
                const total = bookings?.length || 0
                const completed = bookings?.filter(b => b.status === 'completed').length || 0
                const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0

                // Calculate average rating
                const ratings = reviews?.map(r => r.rating) || []
                const avgRating = ratings.length > 0
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : 0

                // Group by routes
                const routeCounts: Record<string, { origin: string; destination: string; count: number }> = {}
                bookings?.forEach(booking => {
                    const route = booking.transport_routes as any
                    if (route) {
                        const key = `${route.origin}-${route.destination}`
                        if (!routeCounts[key]) {
                            routeCounts[key] = { origin: route.origin, destination: route.destination, count: 0 }
                        }
                        routeCounts[key].count++
                    }
                })

                const topRoutes = Object.values(routeCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                setData({
                    totalTrips: total,
                    completedTrips: completed,
                    cancelledTrips: cancelled,
                    avgRating: Number(avgRating.toFixed(1)),
                    onTimeRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    avgOccupancy: 75,
                    topRoutes
                })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        {
            label: 'Tổng số chuyến',
            value: data.totalTrips,
            icon: BarChart3,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            change: '+12%',
            trend: 'up'
        },
        {
            label: 'Hoàn thành',
            value: data.completedTrips,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            change: '+8%',
            trend: 'up'
        },
        {
            label: 'Đã hủy',
            value: data.cancelledTrips,
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
            change: '-5%',
            trend: 'down'
        },
        {
            label: 'Đánh giá TB',
            value: data.avgRating,
            icon: Star,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100 dark:bg-amber-900/20',
            change: '+0.2',
            trend: 'up'
        },
        {
            label: 'Tỷ lệ đúng giờ',
            value: `${data.onTimeRate}%`,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            change: '+3%',
            trend: 'up'
        },
        {
            label: 'Tỷ lệ lấp đầy',
            value: `${data.avgOccupancy}%`,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            change: '+5%',
            trend: 'up'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-primary/10 rounded-2xl">
                        <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            Hiệu suất Hoạt động
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Phân tích dữ liệu vận hành thời gian thực
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-center">
                    {(['week', 'month', 'year'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${period === p
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className={`p-3 ${stat.bgColor} rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">{stat.label}</p>
                            <div className={`flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {stat.change}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Top Routes */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Tuyến đường phổ biến
                    </h2>
                </div>
                {data.topRoutes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.topRoutes.map((route, index) => (
                            <motion.div
                                key={`${route.origin}-${route.destination}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm group-hover:scale-110 transition-all">
                                    #{index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {route.origin} → {route.destination}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            className="bg-primary rounded-full h-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(route.count / (data.topRoutes[0]?.count || 1)) * 100}%` }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{route.count}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">chuyến</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                        Chưa có dữ liệu tuyến đường
                    </div>
                )}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Biểu đồ Hiệu suất
                </h2>
                <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">
                            Biểu đồ sẽ hiển thị khi có đủ dữ liệu
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
