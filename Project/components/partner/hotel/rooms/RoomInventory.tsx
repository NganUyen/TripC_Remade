'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

export function RoomInventory() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Tồn kho Phòng
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý số lượng phòng còn trống
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <ClipboardList className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Tồn kho Phòng
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}