'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Plane } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('month');

  const metrics = [
    { label: 'Tổng doanh thu', value: '248.5B ₫', change: '+12.5%', icon: DollarSign, color: 'blue' },
    { label: 'Hành khách', value: '49,700', change: '+8.3%', icon: Users, color: 'green' },
    { label: 'Chuyến bay', value: '345', change: '+5.2%', icon: Plane, color: 'purple' },
    { label: 'Tỷ lệ lấp đầy', value: '80%', change: '+3.1%', icon: TrendingUp, color: 'orange' }
  ];

  const monthlyData = [
    { month: 'T1', revenue: 180 },
    { month: 'T2', revenue: 220 },
    { month: 'T3', revenue: 195 },
    { month: 'T4', revenue: 240 },
    { month: 'T5', revenue: 260 },
    { month: 'T6', revenue: 285 }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Phân tích Tổng quan
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Theo dõi hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`w-10 h-10 text-${metric.color}-500`} />
              <span className="text-green-600 text-sm font-semibold">{metric.change}</span>
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-6">Doanh thu theo tháng (Tỉ đồng)</h3>
        <div className="flex items-end justify-between gap-4 h-64">
          {monthlyData.map((data, index) => (
            <motion.div
              key={data.month}
              initial={{ height: 0 }}
              animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg relative group cursor-pointer hover:from-primary/90 hover:to-primary/50 transition-all"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-semibold">{data.revenue}B</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">{data.month}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Tuyến bay phổ biến</h3>
        <div className="space-y-3">
          {[
            { route: 'HAN - SGN', revenue: 92.5, percentage: 88 },
            { route: 'SGN - DAD', revenue: 62.5, percentage: 75 },
            { route: 'HAN - DAD', revenue: 51.0, percentage: 65 }
          ].map((route, index) => (
            <motion.div
              key={route.route}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-32">
                <p className="font-semibold">{route.route}</p>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${route.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  />
                </div>
              </div>
              <div className="w-24 text-right">
                <p className="font-bold">{route.revenue}B ₫</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
