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
    ArrowDownRight
} from 'lucide-react'

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
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
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
    const stats = [
        {
            title: 'Doanh thu hôm nay',
            value: '12.5M VNĐ',
            change: 12.5,
            icon: DollarSign,
            trend: 'up' as const
        },
        {
            title: 'Đơn hàng đang xử lý',
            value: '24',
            change: 8.3,
            icon: ShoppingCart,
            trend: 'up' as const
        },
        {
            title: 'Khách hàng mới',
            value: '156',
            change: 5.2,
            icon: Users,
            trend: 'up' as const
        },
        {
            title: 'Thời gian phục vụ TB',
            value: '18 phút',
            change: 3.1,
            icon: Clock,
            trend: 'down' as const
        }
    ]

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
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
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
                                className={`p-3 rounded-lg border-l-4 ${
                                    alert.severity === 'high' 
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
