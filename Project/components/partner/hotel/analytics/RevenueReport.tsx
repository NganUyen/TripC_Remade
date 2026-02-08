'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

export function RevenueReport() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Doanh thu
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Phân tích doanh thu và lợi nhuận
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <DollarSign className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Báo cáo Doanh thu
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}
