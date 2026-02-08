'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Download, Calendar } from 'lucide-react';

export function FinancialReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const reports = [
    { id: '1', name: 'Báo cáo Doanh thu', date: '2025-01', type: 'revenue' },
    { id: '2', name: 'Báo cáo Chi phí', date: '2025-01', type: 'expense' },
    { id: '3', name: 'Báo cáo Thuế', date: '2025-01', type: 'tax' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Tài chính
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Báo cáo tài chính chi tiết
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-primary" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{report.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(report.date).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-primary" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
