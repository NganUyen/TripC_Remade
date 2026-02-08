"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Ticket,
    Search,
    Filter,
    Eye,
    Check,
    X,
    Clock,
    MapPin,
    User,
    Phone,
    Calendar,
    DollarSign,
    MoreVertical
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Booking {
    id: string
    booking_code: string
    status: 'held' | 'confirmed' | 'completed' | 'cancelled' | 'payment_failed'
    total_amount: number
    created_at: string
    held_at: string
    expires_at: string
    passenger_info: {
        name?: string
        phone?: string
        email?: string
    }
    transport_routes?: {
        origin: string
        destination: string
        departure_time: string
        arrival_time: string
        vehicle_type: string
        type: string
    }
}

export function BookingManagement() {
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_code,
                    status,
                    total_amount,
                    created_at,
                    held_at,
                    expires_at,
                    passenger_info,
                    transport_routes (
                        origin,
                        destination,
                        departure_time,
                        arrival_time,
                        vehicle_type,
                        type
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching bookings:', error)
            } else {
                setBookings((data as unknown as Booking[]) || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId)

            if (error) {
                console.error('Error updating booking:', error)
            } else {
                fetchBookings()
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const getStatusBadge = (status: Booking['status']) => {
        const config = {
            held: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'Đang giữ chỗ' },
            confirmed: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Đã xác nhận' },
            completed: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'Hoàn thành' },
            cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Đã hủy' },
            payment_failed: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Thanh toán lỗi' }
        }
        const c = config[status] || config.held
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.passenger_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.passenger_info?.phone?.includes(searchTerm)
        const matchesFilter = filterStatus === 'all' || booking.status === filterStatus
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Quản lý Đặt chỗ
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Xem và quản lý tất cả các đơn đặt chỗ
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Tổng', value: bookings.length, color: 'text-slate-900 dark:text-white' },
                    { label: 'Đang giữ', value: bookings.filter(b => b.status === 'held').length, color: 'text-amber-600' },
                    { label: 'Xác nhận', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-600' },
                    { label: 'Hoàn thành', value: bookings.filter(b => b.status === 'completed').length, color: 'text-blue-600' },
                    { label: 'Đã hủy', value: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-600' }
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm mã đặt chỗ, tên, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="held">Đang giữ chỗ</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="payment_failed">Thanh toán lỗi</option>
                </select>
            </div>

            {/* Bookings Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Mã đặt chỗ</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Khách hàng</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Tuyến</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Thời gian</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Tổng tiền</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Trạng thái</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredBookings.map((booking, index) => (
                                    <motion.tr
                                        key={booking.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-semibold text-primary">
                                                {booking.booking_code || booking.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {booking.passenger_info?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {booking.passenger_info?.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.transport_routes ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-900 dark:text-white">
                                                        {(booking.transport_routes as any).origin} → {(booking.transport_routes as any).destination}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                {formatDateTime(booking.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(booking.total_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-400" />
                                                </button>
                                                {booking.status === 'held' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Xác nhận"
                                                        >
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Hủy"
                                                        >
                                                            <X className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Hoàn thành"
                                                    >
                                                        <Check className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Ticket className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Chưa có đặt chỗ nào
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Các đơn đặt chỗ sẽ xuất hiện ở đây
                        </p>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Chi tiết đặt chỗ
                            </h2>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <span className="text-slate-600 dark:text-slate-400">Mã đặt chỗ</span>
                                <span className="font-mono font-bold text-primary">
                                    {selectedBooking.booking_code || selectedBooking.id.slice(0, 8)}
                                </span>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Thông tin khách hàng</h4>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>{selectedBooking.passenger_info?.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{selectedBooking.passenger_info?.phone || 'N/A'}</span>
                                </div>
                            </div>

                            {selectedBooking.transport_routes && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Thông tin tuyến</h4>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>
                                            {(selectedBooking.transport_routes as any).origin} → {(selectedBooking.transport_routes as any).destination}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>{formatDateTime((selectedBooking.transport_routes as any).departure_time)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                                <span className="font-medium">Tổng tiền</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(selectedBooking.total_amount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Trạng thái</span>
                                {getStatusBadge(selectedBooking.status)}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
