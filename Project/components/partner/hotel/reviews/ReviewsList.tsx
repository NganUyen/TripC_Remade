'use client';

import React from 'react';
import { Star } from 'lucide-react';

export function ReviewsList() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách Đánh giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Xem và quản lý đánh giá của khách
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <Star className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Danh sách Đánh giá
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}
