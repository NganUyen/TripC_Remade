"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    ChefHat, 
    Clock, 
    CheckCircle2,
    AlertCircle,
    Timer,
    UtensilsCrossed
} from 'lucide-react'

interface KitchenOrder {
    id: string
    tableNumber: string
    items: {
        name: string
        quantity: number
        notes?: string
    }[]
    status: 'pending' | 'preparing' | 'ready'
    orderTime: string
    elapsedTime: number // in minutes
    priority: 'normal' | 'high'
}

export function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<KitchenOrder[]>([
        {
            id: '1',
            tableNumber: 'T01',
            items: [
                { name: 'Phở Bò Đặc Biệt', quantity: 2 },
                { name: 'Gỏi Cuốn', quantity: 1, notes: 'Không rau thơm' }
            ],
            status: 'preparing',
            orderTime: '18:30',
            elapsedTime: 8,
            priority: 'normal'
        },
        {
            id: '2',
            tableNumber: 'V01',
            items: [
                { name: 'Bún Chả', quantity: 4 },
                { name: 'Nem Rán', quantity: 2 }
            ],
            status: 'pending',
            orderTime: '18:35',
            elapsedTime: 3,
            priority: 'high'
        },
        {
            id: '3',
            tableNumber: 'T03',
            items: [
                { name: 'Cà Phê Đen', quantity: 2 }
            ],
            status: 'ready',
            orderTime: '18:20',
            elapsedTime: 18,
            priority: 'normal'
        }
    ])

    const [filterStatus, setFilterStatus] = useState<'all' | KitchenOrder['status']>('all')

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus)

    const updateOrderStatus = (orderId: string, newStatus: KitchenOrder['status']) => {
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ))
    }

    const getStatusColor = (status: KitchenOrder['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300'
            case 'preparing':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300'
            case 'ready':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getStatusLabel = (status: KitchenOrder['status']) => {
        switch (status) {
            case 'pending':
                return 'Đang chờ'
            case 'preparing':
                return 'Đang nấu'
            case 'ready':
                return 'Đã xong'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Hệ thống Hiển thị Nhà bếp (KDS)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Điều phối trạng thái chế biến món ăn theo thời gian thực
                    </p>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                        filterStatus === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    Tất cả
                </button>
                {(['pending', 'preparing', 'ready'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                            filterStatus === status
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        {getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order, index) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 
                            ${getStatusColor(order.status)}
                            ${order.priority === 'high' ? 'ring-2 ring-red-500' : ''}
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ChefHat className="w-5 h-5" />
                                <span className="font-bold text-lg">Bàn {order.tableNumber}</span>
                            </div>
                            {order.priority === 'high' && (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                        </div>

                        {/* Time Info */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{order.orderTime}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${
                                order.elapsedTime > 15 ? 'text-red-600 dark:text-red-400' : ''
                            }`}>
                                <Timer className="w-4 h-4" />
                                <span>{order.elapsedTime} phút</span>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-4">
                            {order.items.map((item, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {item.name}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            x{item.quantity}
                                        </span>
                                    </div>
                                    {item.notes && (
                                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            📝 {item.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                            <span className={`
                                inline-block px-3 py-1 rounded-lg text-xs font-semibold
                                ${getStatusColor(order.status)}
                            `}>
                                {getStatusLabel(order.status)}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UtensilsCrossed className="w-4 h-4" />
                                    Bắt đầu nấu
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Hoàn thành
                                </button>
                            )}
                            {order.status === 'ready' && (
                                <div className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Sẵn sàng phục vụ
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                    { label: 'Đang chờ', count: orders.filter(o => o.status === 'pending').length, color: 'amber' },
                    { label: 'Đang nấu', count: orders.filter(o => o.status === 'preparing').length, color: 'blue' },
                    { label: 'Đã xong', count: orders.filter(o => o.status === 'ready').length, color: 'green' }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center"
                    >
                        <div className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>
                            {stat.count}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
