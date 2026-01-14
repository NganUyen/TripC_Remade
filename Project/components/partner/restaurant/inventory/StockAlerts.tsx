"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    AlertTriangle, 
    Package,
    Bell,
    CheckCircle2,
    XCircle,
    Settings
} from 'lucide-react'

interface StockAlert {
    id: string
    stockItemName: string
    category: string
    currentStock: number
    minStock: number
    unit: string
    severity: 'critical' | 'warning' | 'info'
    createdAt: string
    isRead: boolean
}

export function StockAlerts() {
    const [alerts, setAlerts] = useState<StockAlert[]>([
        {
            id: '1',
            stockItemName: 'Thịt bò',
            category: 'Thịt',
            currentStock: 5,
            minStock: 20,
            unit: 'kg',
            severity: 'critical',
            createdAt: '2024-05-20T10:00:00',
            isRead: false
        },
        {
            id: '2',
            stockItemName: 'Rau thơm',
            category: 'Rau củ',
            currentStock: 8,
            minStock: 10,
            unit: 'kg',
            severity: 'warning',
            createdAt: '2024-05-20T09:30:00',
            isRead: false
        },
        {
            id: '3',
            stockItemName: 'Gia vị',
            category: 'Gia vị',
            currentStock: 25,
            minStock: 30,
            unit: 'gói',
            severity: 'info',
            createdAt: '2024-05-19T15:00:00',
            isRead: true
        }
    ])

    const [filterSeverity, setFilterSeverity] = useState<'all' | StockAlert['severity']>('all')
    const [showRead, setShowRead] = useState(true)

    const filteredAlerts = alerts.filter(alert => {
        const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
        const matchesRead = showRead || !alert.isRead
        return matchesSeverity && matchesRead
    })

    const markAsRead = (id: string) => {
        setAlerts(alerts.map(alert => 
            alert.id === id ? { ...alert, isRead: true } : alert
        ))
    }

    const getSeverityColor = (severity: StockAlert['severity']) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
            case 'warning':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getSeverityLabel = (severity: StockAlert['severity']) => {
        switch (severity) {
            case 'critical':
                return 'Nghiêm trọng'
            case 'warning':
                return 'Cảnh báo'
            case 'info':
                return 'Thông tin'
            default:
                return severity
        }
    }

    const unreadCount = alerts.filter(a => !a.isRead).length
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isRead).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Cảnh báo Tồn kho
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Hệ thống thông báo khi nguyên liệu xuống dưới mức an toàn
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                            {unreadCount} chưa đọc
                        </span>
                    )}
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Cài đặt
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {criticalCount}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Cảnh báo nghiêm trọng
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20">
                            <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {alerts.filter(a => a.severity === 'warning' && !a.isRead).length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Cảnh báo
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {alerts.length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Tổng cảnh báo
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex gap-4">
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">Tất cả mức độ</option>
                        <option value="critical">Nghiêm trọng</option>
                        <option value="warning">Cảnh báo</option>
                        <option value="info">Thông tin</option>
                    </select>
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showRead}
                            onChange={(e) => setShowRead(e.target.checked)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            Hiển thị đã đọc
                        </span>
                    </label>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 
                            ${getSeverityColor(alert.severity)}
                            ${!alert.isRead ? 'ring-2 ring-primary/50' : ''}
                        `}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {alert.stockItemName}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                                        {getSeverityLabel(alert.severity)}
                                    </span>
                                    {!alert.isRead && (
                                        <span className="px-2 py-1 bg-primary text-white rounded-lg text-xs font-semibold">
                                            Mới
                                        </span>
                                    )}
                                </div>

                                <div className="ml-8 space-y-2">
                                    <div className="text-sm">
                                        <span className="font-semibold">Danh mục:</span> {alert.category}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">Tồn kho hiện tại:</span>{' '}
                                        <span className="text-red-600 dark:text-red-400 font-bold">
                                            {alert.currentStock} {alert.unit}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">Mức tối thiểu:</span>{' '}
                                        {alert.minStock} {alert.unit}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(alert.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!alert.isRead && (
                                    <button
                                        onClick={() => markAsRead(alert.id)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Đã xem
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredAlerts.length === 0 && (
                <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                        Không có cảnh báo nào
                    </p>
                </div>
            )}
        </div>
    )
}
