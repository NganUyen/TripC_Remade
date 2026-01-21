"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    BarChart3, 
    TrendingUp,
    TrendingDown,
    UtensilsCrossed,
    DollarSign,
    Clock,
    Award,
    Calendar
} from 'lucide-react'

interface MenuItemAnalytics {
    name: string
    sales: number
    revenue: number
    profit: number
    profitMargin: number
}

export function Analytics() {
    const [activeTab, setActiveTab] = useState<'menu-engineering' | 'heatmap' | 'performance'>('menu-engineering')

    const menuItems: MenuItemAnalytics[] = [
        { name: 'Phở Bò Đặc Biệt', sales: 245, revenue: 29400000, profit: 14700000, profitMargin: 50 },
        { name: 'Bún Chả', sales: 189, revenue: 17955000, profit: 8977500, profitMargin: 50 },
        { name: 'Gỏi Cuốn', sales: 156, revenue: 13260000, profit: 6630000, profitMargin: 50 },
        { name: 'Cà Phê Đen', sales: 312, revenue: 15600000, profit: 10920000, profitMargin: 70 }
    ]

    const heatmapData = [
        { hour: '10:00', orders: 12, revenue: 2400000 },
        { hour: '11:00', orders: 18, revenue: 3600000 },
        { hour: '12:00', orders: 45, revenue: 9000000 },
        { hour: '13:00', orders: 38, revenue: 7600000 },
        { hour: '14:00', orders: 15, revenue: 3000000 },
        { hour: '17:00', orders: 22, revenue: 4400000 },
        { hour: '18:00', orders: 52, revenue: 10400000 },
        { hour: '19:00', orders: 48, revenue: 9600000 },
        { hour: '20:00', orders: 35, revenue: 7000000 },
        { hour: '21:00', orders: 18, revenue: 3600000 }
    ]

    const bestSellers = menuItems.sort((a, b) => b.sales - a.sales).slice(0, 3)
    const highestProfit = menuItems.sort((a, b) => b.profit - a.profit).slice(0, 3)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Phân tích & Báo cáo
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Phân tích hiệu suất kinh doanh và tối ưu hóa thực đơn
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('menu-engineering')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'menu-engineering'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Menu Engineering
                </button>
                <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'heatmap'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Heatmap
                </button>
                <button
                    onClick={() => setActiveTab('performance')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'performance'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Hiệu suất
                </button>
            </div>

            {/* Menu Engineering */}
            {activeTab === 'menu-engineering' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                Món bán chạy nhất
                            </h3>
                            <div className="space-y-3">
                                {bestSellers.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-slate-400' :
                                                'bg-amber-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {item.sales} đơn
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                Món lợi nhuận cao nhất
                            </h3>
                            <div className="space-y-3">
                                {highestProfit.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-green-500">
                                                {index + 1}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {item.profit.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Chi tiết Menu Engineering
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Món ăn</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng bán</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Doanh thu</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Lợi nhuận</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tỷ suất LN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuItems.map((item) => (
                                        <tr key={item.name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                            <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{item.sales}</td>
                                            <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{item.revenue.toLocaleString('vi-VN')} VNĐ</td>
                                            <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">{item.profit.toLocaleString('vi-VN')} VNĐ</td>
                                            <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{item.profitMargin}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Heatmap */}
            {activeTab === 'heatmap' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                            Heatmap - Khung giờ cao điểm
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {heatmapData.map((data) => {
                                const maxRevenue = Math.max(...heatmapData.map(d => d.revenue))
                                const intensity = (data.revenue / maxRevenue) * 100
                                return (
                                    <div
                                        key={data.hour}
                                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-center"
                                        style={{
                                            backgroundColor: `rgba(255, 94, 31, ${intensity / 100})`,
                                            borderColor: intensity > 70 ? '#FF5E1F' : undefined
                                        }}
                                    >
                                        <div className="font-bold text-slate-900 dark:text-white mb-2">
                                            {data.hour}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                            {data.orders} đơn
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {(data.revenue / 1000000).toFixed(1)}M VNĐ
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Thời gian phục vụ trung bình
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-slate-700 dark:text-slate-300">Trung bình</span>
                                <span className="font-bold text-slate-900 dark:text-white">18 phút</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-slate-700 dark:text-slate-300">Nhanh nhất</span>
                                <span className="font-bold text-green-600 dark:text-green-400">12 phút</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-slate-700 dark:text-slate-300">Chậm nhất</span>
                                <span className="font-bold text-red-600 dark:text-red-400">32 phút</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance */}
            {activeTab === 'performance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Doanh thu hôm nay', value: '12.5M VNĐ', change: 12.5, trend: 'up' as const, icon: DollarSign },
                        { label: 'Đơn hàng hôm nay', value: '45', change: 8.3, trend: 'up' as const, icon: UtensilsCrossed },
                        { label: 'Thời gian phục vụ TB', value: '18 phút', change: -3.1, trend: 'down' as const, icon: Clock },
                        { label: 'Tỷ lệ lấp đầy bàn', value: '78%', change: 5.2, trend: 'up' as const, icon: Calendar },
                        { label: 'Khách hàng mới', value: '156', change: 12.5, trend: 'up' as const, icon: TrendingUp },
                        { label: 'Đánh giá trung bình', value: '4.8/5', change: 0.2, trend: 'up' as const, icon: Award }
                    ].map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <metric.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${
                                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {metric.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(metric.change)}%
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {metric.value}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {metric.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
