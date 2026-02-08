"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    DollarSign,
    Users,
    ShoppingCart,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Store,
    Loader2
} from 'lucide-react'
import { partnerApi, PartnerDashboardStats } from '@/lib/partner/api'
import { useUser } from '@clerk/nextjs'

interface StatCardProps {
    title: string
    value: string
    change: number
    icon: React.ElementType
    trend: 'up' | 'down'
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(change)}%
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {value}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {title}
            </p>
        </motion.div>
    )
}

export function RestaurantDashboard() {
    const { user } = useUser()
    const [stats, setStats] = React.useState<PartnerDashboardStats | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchStats = async () => {
            if (!user) return
            try {
                // First get venues to update dashboard for the first one
                const venues = await partnerApi.getMyVenues(user.id)
                if (venues.length > 0) {
                    const data = await partnerApi.getDashboardStats(venues[0].id, user.id)
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [user])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Default mock stats if API fails or no data yet, to keep UI looking good for demo
    const displayStats = [
        {
            title: 'Doanh thu hôm nay',
            value: stats ? `${stats.todayRevenue.toLocaleString()} VNĐ` : '0 VNĐ',
            change: stats?.todayRevenueChange || 0,
            icon: DollarSign,
            trend: (stats?.todayRevenueChange || 0) >= 0 ? 'up' : 'down'
        },
        {
            title: 'Đơn hàng đang xử lý',
            value: stats?.pendingOrders.toString() || '0',
            change: stats?.pendingOrdersChange || 0,
            icon: ShoppingCart,
            trend: (stats?.pendingOrdersChange || 0) >= 0 ? 'up' : 'down'
        },
        {
            title: 'Khách hàng mới',
            value: stats?.newCustomers.toString() || '0',
            change: stats?.newCustomersChange || 0,
            icon: Users,
            trend: (stats?.newCustomersChange || 0) >= 0 ? 'up' : 'down'
        },
        {
            title: 'Thời gian phục vụ TB',
            value: stats ? `${stats.avgServiceTime} phút` : '0 phút',
            change: stats?.avgServiceTimeChange || 0,
            icon: Clock,
            trend: (stats?.avgServiceTimeChange || 0) <= 0 ? 'up' : 'down' // Lower time is better (up/green)
        }
    ] as const

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Dashboard Nhà hàng
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Tổng quan hoạt động và hiệu suất của nhà hàng
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* @ts-ignore - trend logic tricky with const assertion */}
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Tạo đơn mới', icon: ShoppingCart },
                            { label: 'Quản lý bàn', icon: TrendingUp },
                            { label: 'Cập nhật thực đơn', icon: DollarSign },
                            { label: 'Xem báo cáo', icon: Users }
                        ].map((action) => (
                            <button
                                key={action.label}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:border-primary/20 border border-slate-200 dark:border-slate-700 transition-all text-left"
                            >
                                <action.icon className="w-5 h-5 text-primary mb-2" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {action.label}
                                </p>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Cảnh báo & Thông báo
                    </h3>
                    <div className="space-y-3">
                        {[
                            { message: 'Nguyên liệu thịt bò sắp hết', severity: 'high' },
                            { message: 'Bàn số 5 đã quá giờ', severity: 'medium' },
                            { message: '3 đơn hàng đang chờ xử lý', severity: 'low' }
                        ].map((alert, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border-l-4 ${alert.severity === 'high'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                    : alert.severity === 'medium'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                    }`}
                            >
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {alert.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
