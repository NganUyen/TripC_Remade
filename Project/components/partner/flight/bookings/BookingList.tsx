/**
 * Booking List Component for Flight Partner
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';

interface BookingListProps {
  partnerId: string;
}

export default function BookingList({ partnerId }: BookingListProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [partnerId]);

  async function fetchBookings() {
    try {
      const response = await fetch('/api/partner/flight/bookings', {
        headers: {
          'x-partner-id': partnerId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách Đặt vé
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý đặt vé của khách hàng
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đặt vé..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-slate-500">Đang tải...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có đặt vé
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {booking.booking_reference}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {booking.passenger_count} hành khách
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
