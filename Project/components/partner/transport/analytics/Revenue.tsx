"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    PiggyBank,
    Calendar
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RevenueData {
    totalRevenue: number
    periodRevenue: number
    avgTicketPrice: number
    revenueByDay: Array<{ date: string; revenue: number }>
    revenueByType: Array<{ type: string; revenue: number }>
}

export function Revenue() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<RevenueData>({
        totalRevenue: 0,
        periodRevenue: 0,
        avgTicketPrice: 0,
        revenueByDay: [],
        revenueByType: []
    })
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

    useEffect(() => {
        fetchRevenueData()
    }, [period])

    const fetchRevenueData = async () => {
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

            // Fetch all bookings for total revenue (restricted to provider)
            const { data: allBookings } = await supabase
                .from('bookings')
                .select(`
                    total_amount,
                    transport_routes!inner(provider_id)
                `)
                .in('status', ['confirmed', 'completed'])
                .in('transport_routes.provider_id', providerIds)

            // Fetch period bookings (restricted to provider)
            const { data: periodBookings, error } = await supabase
                .from('bookings')
                .select(`
                    total_amount,
                    created_at,
                    transport_routes!inner (
                        type,
                        provider_id
                    )
                `)
                .in('status', ['confirmed', 'completed'])
                .in('transport_routes.provider_id', providerIds)
                .gte('created_at', startDate.toISOString())

            if (error) {
                console.error('Error fetching revenue:', error)
            } else {
                const totalRevenue = allBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
                const periodRevenue = periodBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
                const avgTicketPrice = periodBookings?.length
                    ? Math.round(periodRevenue / periodBookings.length)
                    : 0

                // Group by day
                const revenueByDayMap: Record<string, number> = {}
                periodBookings?.forEach(booking => {
                    const date = new Date(booking.created_at).toLocaleDateString('vi-VN')
                    revenueByDayMap[date] = (revenueByDayMap[date] || 0) + (booking.total_amount || 0)
                })
                const revenueByDay = Object.entries(revenueByDayMap)
                    .map(([date, revenue]) => ({ date, revenue }))
                    .slice(-7)

                // Group by type
                const revenueByTypeMap: Record<string, number> = {}
                periodBookings?.forEach(booking => {
                    const type = (booking.transport_routes as any)?.type || 'other'
                    revenueByTypeMap[type] = (revenueByTypeMap[type] || 0) + (booking.total_amount || 0)
                })
                const revenueByType = Object.entries(revenueByTypeMap)
                    .map(([type, revenue]) => ({ type, revenue }))
                    .sort((a, b) => b.revenue - a.revenue)

                setData({
                    totalRevenue,
                    periodRevenue,
                    avgTicketPrice,
                    revenueByDay,
                    revenueByType
                })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M VNĐ'
        }
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
    }

    const getVehicleTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'bus': 'Xe buýt',
            'limousine': 'Limousine',
            'private_car': 'Xe riêng',
            'train': 'Tàu',
            'airplane': 'Máy bay',
            'other': 'Khác'
        }
        return labels[type] || type
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-500/10 rounded-2xl">
                        <Wallet className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Doanh thu
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Báo cáo tài chính và hiệu quả kinh doanh
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

            {/* Revenue Stats */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <DollarSign className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                                    <DollarSign className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
                                    <ArrowUpRight className="w-4 h-4" />
                                    +15%
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Tổng doanh thu</p>
                            <p className="text-4xl font-black tracking-tight">{formatCurrency(data.totalRevenue)}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <Wallet className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                    <Wallet className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full">
                                    <TrendingUp className="w-4 h-4" />
                                    +12%
                                </div>
                            </div>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">
                                Doanh thu {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                            </p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(data.periodRevenue)}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <CreditCard className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-blue-500/10 rounded-2xl">
                                    <CreditCard className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-full">
                                    <TrendingUp className="w-4 h-4" />
                                    +8%
                                </div>
                            </div>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Giá vé trung bình</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(data.avgTicketPrice)}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Doanh thu theo loại xe
                        </h2>
                    </div>
                    {data.revenueByType.length > 0 ? (
                        <div className="space-y-6">
                            {data.revenueByType.map((item, index) => {
                                const maxRevenue = data.revenueByType[0]?.revenue || 1
                                const percentage = (item.revenue / maxRevenue) * 100
                                return (
                                    <motion.div
                                        key={item.type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                                {getVehicleTypeLabel(item.type)}
                                            </span>
                                            <span className="text-sm font-black text-primary">
                                                {formatCurrency(item.revenue)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                className="bg-primary rounded-full h-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Dòng tiền hàng ngày
                        </h2>
                    </div>
                    {data.revenueByDay.length > 0 ? (
                        <div className="space-y-3">
                            {data.revenueByDay.map((day, index) => (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{day.date}</span>
                                    </div>
                                    <span className="text-base font-black text-slate-900 dark:text-white">
                                        {formatCurrency(day.revenue)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl bg-primary w-64 h-64 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <PiggyBank className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Tổng quan tài chính</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Dữ liệu hợp nhất thời gian thực</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="space-y-2">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Doanh thu hôm nay</p>
                            <p className="text-2xl font-black tracking-tight">
                                {formatCurrency(data.revenueByDay[data.revenueByDay.length - 1]?.revenue || 0)}
                            </p>
                            <div className="w-8 h-1 bg-primary rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">TB mỗi ngày</p>
                            <p className="text-2xl font-black tracking-tight">
                                {formatCurrency(data.revenueByDay.length > 0
                                    ? Math.round(data.periodRevenue / data.revenueByDay.length)
                                    : 0
                                )}
                            </p>
                            <div className="w-8 h-1 bg-emerald-500 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Loại xe top</p>
                            <p className="text-2xl font-black tracking-tight">
                                {getVehicleTypeLabel(data.revenueByType[0]?.type || 'N/A')}
                            </p>
                            <div className="w-8 h-1 bg-blue-500 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Số giao dịch</p>
                            <p className="text-2xl font-black tracking-tight">
                                {data.avgTicketPrice > 0 ? Math.round(data.periodRevenue / data.avgTicketPrice) : 0}
                            </p>
                            <div className="w-8 h-1 bg-amber-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
