'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export function FinancialReports() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Tài chính
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Báo cáo tài chính chi tiết
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Báo cáo Tài chính
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Component đang được phát triển...
        </p>
      </div>
    </div>
  );
}
