/**
 * Booking List Component
 * Displays and manages bookings for partner's hotels
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Booking {
  id: string;
  booking_reference: string;
  hotel: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    title: string;
  };
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  rooms_count: number;
  adults_count: number;
  children_count: number;
  total_cents: number;
  status: string;
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'yellow', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'green', icon: CheckCircle },
  checked_in: { label: 'Đã check-in', color: 'blue', icon: CheckCircle },
  checked_out: { label: 'Đã check-out', color: 'slate', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'red', icon: XCircle },
  no_show: { label: 'Không đến', color: 'red', icon: AlertCircle },
};

interface BookingListProps {
  partnerId: string;
}

export function BookingList({ partnerId }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, partnerId]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const url = new URL('/api/partner/hotel/bookings', window.location.origin);
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }

      const response = await fetch(url, {
        headers: {
          'x-partner-id': partnerId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        throw new Error(result.error?.message || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(cents);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Danh sách Đặt phòng
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý đặt phòng và check-in khách
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="h-16 bg-slate-200 dark:bg-slate-700 rounded"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Danh sách Đặt phòng
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý đặt phòng và check-in khách
          </p>
        </div>
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Lỗi: {error}</p>
          <button
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách Đặt phòng
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý đặt phòng và check-in khách
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          'all',
          'pending',
          'confirmed',
          'checked_in',
          'checked_out',
          'cancelled',
        ].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {status === 'all'
              ? 'Tất cả'
              : statusConfig[status as keyof typeof statusConfig]?.label ||
                status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có đặt phòng
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {statusFilter !== 'all'
              ? `Không có đặt phòng ${
                  statusConfig[statusFilter as keyof typeof statusConfig]
                    ?.label
                } nào`
              : 'Đặt phòng sẽ hiển thị tại đây khi khách hàng đặt phòng'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              index={index}
              formatCurrency={formatCurrency}
              onStatusUpdate={fetchBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  index: number;
  formatCurrency: (cents: number) => string;
  onStatusUpdate: () => void;
}

function BookingCard({
  booking,
  index,
  formatCurrency,
  onStatusUpdate,
}: BookingCardProps) {
  const [updating, setUpdating] = useState(false);
  const statusInfo =
    statusConfig[booking.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  const updateStatus = async (newStatus: string) => {
    if (updating) return;

    const confirmed = confirm(
      `Bạn có chắc chắn muốn cập nhật đặt phòng này thành ${
        statusConfig[newStatus as keyof typeof statusConfig]?.label
      }?`
    );
    if (!confirmed) return;

    try {
      setUpdating(true);
      const response = await fetch(
        `/api/partner/hotel/bookings/${booking.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      const result = await response.json();
      if (result.success) {
        onStatusUpdate();
      } else {
        throw new Error(result.error?.message || 'Unknown error');
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {booking.booking_reference}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {booking.hotel.name}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 bg-${statusInfo?.color}-100 text-${statusInfo?.color}-700`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusInfo?.label}
        </span>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <User className="w-4 h-4" />
            Khách
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {booking.guest_name}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-4 h-4" />
            Check-in
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-4 h-4" />
            Check-out
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <DollarSign className="w-4 h-4" />
            Tổng
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(booking.total_cents)}
          </p>
        </div>
      </div>

      {/* Room Details */}
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {booking.rooms_count} × {booking.room.title} • {booking.adults_count}{' '}
        người lớn
        {booking.children_count > 0 && `, ${booking.children_count} trẻ em`}
      </div>

      {/* Actions */}
      {booking.status === 'confirmed' && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus('checked_in')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Đang cập nhật...' : 'Check In'}
          </button>
        </div>
      )}
      {booking.status === 'checked_in' && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus('checked_out')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Đang cập nhật...' : 'Check Out'}
          </button>
        </div>
      )}
      {booking.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus('confirmed')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Đang cập nhật...' : 'Xác nhận'}
          </button>
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Đang cập nhật...' : 'Hủy'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
