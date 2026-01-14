"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Calendar, 
    Clock, 
    Users,
    Phone,
    Mail,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    Filter
} from 'lucide-react'

interface Reservation {
    id: string
    customerName: string
    phone: string
    email?: string
    date: string
    time: string
    guests: number
    tableNumber?: string
    status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed'
    specialRequests?: string
    createdAt: string
}

export function Reservations() {
    const [reservations, setReservations] = useState<Reservation[]>([
        {
            id: '1',
            customerName: 'Nguyễn Văn A',
            phone: '0901234567',
            email: 'nguyenvana@example.com',
            date: '2024-05-20',
            time: '19:00',
            guests: 4,
            status: 'confirmed',
            specialRequests: 'Bàn gần cửa sổ',
            createdAt: '2024-05-19T10:00:00'
        },
        {
            id: '2',
            customerName: 'Trần Thị B',
            phone: '0912345678',
            date: '2024-05-20',
            time: '20:30',
            guests: 2,
            status: 'pending',
            createdAt: '2024-05-19T14:30:00'
        },
        {
            id: '3',
            customerName: 'Lê Văn C',
            phone: '0923456789',
            date: '2024-05-20',
            time: '18:00',
            guests: 6,
            tableNumber: 'V01',
            status: 'seated',
            createdAt: '2024-05-18T09:00:00'
        }
    ])

    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | Reservation['status']>('all')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    const filteredReservations = reservations.filter(res => {
        const matchesSearch = res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            res.phone.includes(searchQuery)
        const matchesStatus = filterStatus === 'all' || res.status === filterStatus
        const matchesDate = res.date === selectedDate
        return matchesSearch && matchesStatus && matchesDate
    })

    const updateReservationStatus = (id: string, status: Reservation['status']) => {
        setReservations(reservations.map(res => 
            res.id === id ? { ...res, status } : res
        ))
    }

    const getStatusColor = (status: Reservation['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            case 'confirmed':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            case 'seated':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            case 'completed':
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getStatusLabel = (status: Reservation['status']) => {
        switch (status) {
            case 'pending':
                return 'Chờ xác nhận'
            case 'confirmed':
                return 'Đã xác nhận'
            case 'seated':
                return 'Đã vào bàn'
            case 'cancelled':
                return 'Đã hủy'
            case 'completed':
                return 'Hoàn thành'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Đặt bàn
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tiếp nhận và xác nhận lịch đặt bàn từ khách hàng
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, SĐT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="seated">Đã vào bàn</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="completed">Hoàn thành</option>
                    </select>
                </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
                {filteredReservations.map((reservation, index) => (
                    <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {reservation.customerName}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                        {getStatusLabel(reservation.status)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{reservation.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{reservation.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{reservation.guests} người</span>
                                    </div>
                                    {reservation.tableNumber && (
                                        <div className="flex items-center gap-1">
                                            <span>Bàn: {reservation.tableNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Phone className="w-4 h-4" />
                                <span>{reservation.phone}</span>
                            </div>
                            {reservation.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span>{reservation.email}</span>
                                </div>
                            )}
                        </div>

                        {reservation.specialRequests && (
                            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        {reservation.specialRequests}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {reservation.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Xác nhận
                                    </button>
                                    <button
                                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Hủy
                                    </button>
                                </>
                            )}
                            {reservation.status === 'confirmed' && (
                                <button
                                    onClick={() => updateReservationStatus(reservation.id, 'seated')}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Đã vào bàn
                                </button>
                            )}
                            {reservation.status === 'seated' && (
                                <button
                                    onClick={() => updateReservationStatus(reservation.id, 'completed')}
                                    className="flex-1 px-4 py-2 bg-slate-500 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                                >
                                    Hoàn thành
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredReservations.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                        Không có đặt bàn nào cho ngày này
                    </p>
                </div>
            )}
        </div>
    )
}
