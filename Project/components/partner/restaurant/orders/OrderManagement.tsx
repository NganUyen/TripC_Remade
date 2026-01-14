"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    ShoppingCart, 
    QrCode,
    UtensilsCrossed,
    Package,
    Truck,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'

interface Order {
    id: string
    orderNumber: string
    type: 'dine-in' | 'takeaway' | 'delivery'
    tableNumber?: string
    customerName?: string
    phone?: string
    address?: string
    items: {
        name: string
        quantity: number
        price: number
    }[]
    subtotal: number
    tax: number
    serviceFee: number
    total: number
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
    paymentMethod?: 'cash' | 'card' | 'online'
    paymentStatus: 'pending' | 'paid'
    createdAt: string
    notes?: string
}

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: '1',
            orderNumber: 'ORD-001',
            type: 'dine-in',
            tableNumber: 'T01',
            items: [
                { name: 'Phở Bò Đặc Biệt', quantity: 2, price: 120000 },
                { name: 'Gỏi Cuốn', quantity: 1, price: 85000 }
            ],
            subtotal: 325000,
            tax: 32500,
            serviceFee: 16250,
            total: 373750,
            status: 'preparing',
            paymentMethod: 'card',
            paymentStatus: 'pending',
            createdAt: '2024-05-20T18:30:00',
            notes: 'Không rau thơm'
        },
        {
            id: '2',
            orderNumber: 'ORD-002',
            type: 'takeaway',
            customerName: 'Nguyễn Văn A',
            phone: '0901234567',
            items: [
                { name: 'Bún Chả', quantity: 1, price: 95000 }
            ],
            subtotal: 95000,
            tax: 9500,
            serviceFee: 0,
            total: 104500,
            status: 'ready',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            createdAt: '2024-05-20T18:45:00'
        },
        {
            id: '3',
            orderNumber: 'ORD-003',
            type: 'delivery',
            customerName: 'Trần Thị B',
            phone: '0912345678',
            address: '123 Đường ABC, Quận 1, HCMC',
            items: [
                { name: 'Cơm Tấm Sườn', quantity: 2, price: 75000 },
                { name: 'Canh Chua', quantity: 1, price: 65000 }
            ],
            subtotal: 215000,
            tax: 21500,
            serviceFee: 20000,
            total: 256500,
            status: 'delivering',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            createdAt: '2024-05-20T19:00:00'
        }
    ])

    const [filterType, setFilterType] = useState<'all' | Order['type']>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all')

    const filteredOrders = orders.filter(order => {
        const matchesType = filterType === 'all' || order.type === filterType
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus
        return matchesType && matchesStatus
    })

    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(orders.map(order => 
            order.id === id ? { ...order, status } : order
        ))
    }

    const getTypeIcon = (type: Order['type']) => {
        switch (type) {
            case 'dine-in':
                return UtensilsCrossed
            case 'takeaway':
                return Package
            case 'delivery':
                return Truck
            default:
                return ShoppingCart
        }
    }

    const getTypeLabel = (type: Order['type']) => {
        switch (type) {
            case 'dine-in':
                return 'Tại bàn'
            case 'takeaway':
                return 'Mang về'
            case 'delivery':
                return 'Giao hàng'
            default:
                return type
        }
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            case 'confirmed':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            case 'preparing':
                return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
            case 'ready':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            case 'delivering':
                return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
            case 'completed':
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getStatusLabel = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý'
            case 'confirmed':
                return 'Đã xác nhận'
            case 'preparing':
                return 'Đang chế biến'
            case 'ready':
                return 'Sẵn sàng'
            case 'delivering':
                return 'Đang giao'
            case 'completed':
                return 'Hoàn thành'
            case 'cancelled':
                return 'Đã hủy'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Đơn hàng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Xử lý đơn hàng Dine-in, Take-away và Delivery
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Tạo đơn mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Loại đơn
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            <option value="dine-in">Tại bàn</option>
                            <option value="takeaway">Mang về</option>
                            <option value="delivery">Giao hàng</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="preparing">Đang chế biến</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="delivering">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order, index) => {
                    const TypeIcon = getTypeIcon(order.type)
                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <TypeIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {order.orderNumber}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{getTypeLabel(order.type)}</span>
                                                {order.tableNumber && (
                                                    <>
                                        <span>•</span>
                                        <span>Bàn {order.tableNumber}</span>
                                    </>
                                )}
                            </div>
                        </div>
                                    </div>
                                    {order.customerName && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Khách: {order.customerName}
                                            {order.phone && ` • ${order.phone}`}
                                        </p>
                                    )}
                                    {order.address && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            📍 {order.address}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        order.paymentStatus === 'paid'
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                    }`}>
                                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-4 space-y-2">
                                {order.items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                    >
                                        <div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {order.notes && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            {order.notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Tạm tính:</span>
                                    <span className="text-slate-900 dark:text-white">{order.subtotal.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Thuế VAT:</span>
                                    <span className="text-slate-900 dark:text-white">{order.tax.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                {order.serviceFee > 0 && (
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 dark:text-slate-400">Phí dịch vụ:</span>
                                        <span className="text-slate-900 dark:text-white">{order.serviceFee.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-900 dark:text-white">Tổng cộng:</span>
                                    <span className="text-primary">{order.total.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                    >
                                        Xác nhận
                                    </button>
                                )}
                                {order.status === 'confirmed' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                                    >
                                        Bắt đầu chế biến
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                    >
                                        Hoàn thành
                                    </button>
                                )}
                                {order.status === 'ready' && order.type === 'delivery' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'delivering')}
                                        className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                                    >
                                        Bắt đầu giao
                                    </button>
                                )}
                                {(order.status === 'ready' || order.status === 'delivering') && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="flex-1 px-4 py-2 bg-slate-500 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                                    >
                                        Hoàn thành
                                    </button>
                                )}
                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Bạn có chắc muốn hủy đơn này?')) {
                                                updateOrderStatus(order.id, 'cancelled')
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Hủy đơn
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                        Không có đơn hàng nào
                    </p>
                </div>
            )}
        </div>
    )
}
