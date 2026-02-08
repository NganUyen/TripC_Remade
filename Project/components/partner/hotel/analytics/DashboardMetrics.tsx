'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Star } from 'lucide-react';

export function DashboardMetrics() {
  const metrics = [
    { label: 'Tổng doanh thu', value: '125,000,000 VNĐ', change: '+12%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Tỷ lệ lấp đầy', value: '85%', change: '+5%', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Đánh giá TB', value: '4.7/5', change: '+0.2', icon: Star, color: 'text-yellow-600' },
    { label: 'Khách hàng', value: '1,234', change: '+18%', icon: Users, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Chỉ số Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Các chỉ số chính về hoạt động
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-green-600">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Hiệu suất theo tháng
        </h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {[65, 75, 85, 70, 80, 90, 95, 85, 88, 92, 87, 90].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
