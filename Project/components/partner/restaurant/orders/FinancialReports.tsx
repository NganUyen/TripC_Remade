"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    BarChart3, 
    DollarSign,
    TrendingUp,
    Download,
    Calendar,
    Users,
    CreditCard,
    Wallet
} from 'lucide-react'

interface ReportData {
    date: string
    revenue: number
    orders: number
    averageOrderValue: number
    paymentMethods: {
        cash: number
        card: number
        online: number
    }
}

export function FinancialReports() {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

    const reportData: ReportData[] = [
        {
            date: '2024-05-20',
            revenue: 12500000,
            orders: 45,
            averageOrderValue: 277778,
            paymentMethods: {
                cash: 5000000,
                card: 6000000,
                online: 1500000
            }
        },
        {
            date: '2024-05-19',
            revenue: 11800000,
            orders: 42,
            averageOrderValue: 280952,
            paymentMethods: {
                cash: 4800000,
                card: 5500000,
                online: 1500000
            }
        }
    ]

    const totalRevenue = reportData.reduce((sum, day) => sum + day.revenue, 0)
    const totalOrders = reportData.reduce((sum, day) => sum + day.orders, 0)
    const avgRevenue = totalRevenue / reportData.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Báo cáo Tài chính
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Theo dõi doanh thu theo ca, nhân viên và phương thức thanh toán
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Xuất báo cáo
                </button>
            </div>

            {/* Period Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex gap-2 mb-4">
                    {(['today', 'week', 'month', 'custom'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                selectedPeriod === period
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            {period === 'today' ? 'Hôm nay' : 
                             period === 'week' ? 'Tuần này' :
                             period === 'month' ? 'Tháng này' : 'Tùy chọn'}
                        </button>
                    ))}
                </div>
                {selectedPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {totalRevenue.toLocaleString('vi-VN')} VNĐ
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tổng doanh thu
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {totalOrders}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tổng đơn hàng
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {Math.round(avgRevenue).toLocaleString('vi-VN')} VNĐ
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Doanh thu trung bình
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20">
                            <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {Math.round(totalRevenue / totalOrders).toLocaleString('vi-VN')} VNĐ
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Giá trị đơn TB
                    </p>
                </motion.div>
            </div>

            {/* Daily Reports */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    Chi tiết theo ngày
                </h2>
                <div className="space-y-4">
                    {reportData.map((day, index) => (
                        <motion.div
                            key={day.date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {new Date(day.date).toLocaleDateString('vi-VN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                        {day.revenue.toLocaleString('vi-VN')} VNĐ
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {day.orders} đơn hàng
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Tiền mặt</div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {day.paymentMethods.cash.toLocaleString('vi-VN')} VNĐ
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Thẻ</div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {day.paymentMethods.card.toLocaleString('vi-VN')} VNĐ
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Online</div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {day.paymentMethods.online.toLocaleString('vi-VN')} VNĐ
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Đơn TB</div>
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                        {Math.round(day.averageOrderValue).toLocaleString('vi-VN')} VNĐ
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
