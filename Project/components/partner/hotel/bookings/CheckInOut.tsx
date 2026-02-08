'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Clock, Check, X } from 'lucide-react';

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'checked-in' | 'checked-out';
}

export function CheckInOut() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      guestName: 'Nguyễn Văn A',
      roomNumber: '101',
      checkInDate: '2025-02-10',
      checkOutDate: '2025-02-12',
      status: 'pending'
    },
    {
      id: '2',
      guestName: 'Trần Thị B',
      roomNumber: '205',
      checkInDate: '2025-02-09',
      checkOutDate: '2025-02-11',
      status: 'checked-in'
    }
  ]);

  const handleCheckIn = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked-in' as const } : b));
  };

  const handleCheckOut = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked-out' as const } : b));
  };

  const filteredBookings = bookings.filter(b =>
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.roomNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Check-in/Check-out
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý check-in và check-out nhanh
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên khách hoặc số phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {booking.guestName}
                </h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>Phòng: {booking.roomNumber}</p>
                  <p>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Check-in: {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p>
                    Check-out: {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleCheckIn(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                    <Check className="w-4 h-4" />
                    Check-in
                  </button>
                )}
                {booking.status === 'checked-in' && (
                  <button
                    onClick={() => handleCheckOut(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Check className="w-4 h-4" />
                    Check-out
                  </button>
                )}
                {booking.status === 'checked-out' && (
                  <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    Đã trả phòng
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}