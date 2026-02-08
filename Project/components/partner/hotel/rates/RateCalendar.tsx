'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

// Wrapper component for Rate Calendar
// TODO: Implement room selection and pass actual props
export function RateCalendar() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Lịch Giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý giá phòng theo ngày
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Lịch Giá
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Vui lòng chọn phòng để quản lý giá
        </p>
      </div>
    </div>
  );
}
