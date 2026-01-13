"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
    TrendingUp, 
    DollarSign, 
    Calendar, 
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Hotel,
    Users
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

export function HotelDashboard() {
    const stats = [
        {
            title: 'Doanh thu tháng này',
            value: '125M VNĐ',
            change: 15.2,
            icon: DollarSign,
            trend: 'up' as const
        },
        {
            title: 'Đặt phòng hôm nay',
            value: '12',
            change: 8.5,
            icon: Calendar,
            trend: 'up' as const
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: '78%',
            change: 5.3,
            icon: Hotel,
            trend: 'up' as const
        },
        {
            title: 'Đánh giá trung bình',
            value: '4.8/5',
            change: 0.2,
            icon: Star,
            trend: 'up' as const
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Dashboard Khách sạn
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Tổng quan hoạt động và hiệu suất của khách sạn
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

            {/* Quick Actions & Recent Activity */}
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
                            { label: 'Tạo đặt phòng mới', icon: Calendar },
                            { label: 'Quản lý phòng', icon: Hotel },
                            { label: 'Cập nhật giá', icon: DollarSign },
                            { label: 'Xem báo cáo', icon: TrendingUp }
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

                {/* Recent Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Đặt phòng gần đây
                    </h3>
                    <div className="space-y-3">
                        {[
                            { guest: 'Nguyễn Văn A', room: 'Phòng Deluxe', date: '20/05/2024', status: 'confirmed' },
                            { guest: 'Trần Thị B', room: 'Phòng Suite', date: '21/05/2024', status: 'pending' },
                            { guest: 'Lê Văn C', room: 'Phòng Standard', date: '22/05/2024', status: 'confirmed' }
                        ].map((booking, index) => (
                            <div
                                key={index}
                                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                        {booking.guest}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {booking.room} • {booking.date}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                    booking.status === 'confirmed'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                }`}>
                                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
