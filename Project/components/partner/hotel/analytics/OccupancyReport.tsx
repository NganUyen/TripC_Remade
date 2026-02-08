'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BedDouble, TrendingUp } from 'lucide-react';

export function OccupancyReport() {
  const roomTypes = [
    { name: 'Deluxe Room', total: 20, occupied: 18, rate: 90 },
    { name: 'Suite Room', total: 10, occupied: 8, rate: 80 },
    { name: 'Family Room', total: 15, occupied: 12, rate: 80 }
  ];

  const overallRate = (roomTypes.reduce((sum, r) => sum + r.occupied, 0) / roomTypes.reduce((sum, r) => sum + r.total, 0) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Công suất
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Tỷ lệ lấp đầy phòng theo thời gian
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <BedDouble className="w-8 h-8" />
          <h2 className="text-xl font-semibold">Tỷ lệ lấp đầy tổng thể</h2>
        </div>
        <p className="text-6xl font-bold">{overallRate}%</p>
      </div>

      <div className="space-y-4">
        {roomTypes.map((room, index) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{room.name}</h3>
              <span className="text-2xl font-bold text-primary">{room.rate}%</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span>Đang sử dụng: {room.occupied}/{room.total}</span>
              <span>Còn trống: {room.total - room.occupied}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${room.rate}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
