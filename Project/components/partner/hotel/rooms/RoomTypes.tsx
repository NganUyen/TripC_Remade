'use client';

import React from 'react';
import { BedDouble } from 'lucide-react';

export function RoomTypes() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Loại Phòng
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý các loại phòng và thông tin
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <BedDouble className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Loại Phòng
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}