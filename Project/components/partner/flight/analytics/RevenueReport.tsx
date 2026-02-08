"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Download, TrendingUp, Calendar } from "lucide-react";

export default function RevenueReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const revenueData = {
    week: { total: 58500000000, growth: 5.2, avgPerFlight: 169565217 },
    month: { total: 248500000000, growth: 12.5, avgPerFlight: 720289855 },
    year: { total: 2980000000000, growth: 18.3, avgPerFlight: 860919540 },
  };

  const currentData = revenueData[selectedPeriod as keyof typeof revenueData];

  const breakdownData = [
    { category: "Vé Phổ thông", amount: 150000000000, percentage: 60 },
    { category: "Vé Thương gia", amount: 75000000000, percentage: 30 },
    { category: "Vé Hạng nhất", amount: 18500000000, percentage: 7.5 },
    { category: "Dịch vụ bổ sung", amount: 5000000000, percentage: 2.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Báo cáo Doanh thu
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Phân tích doanh thu chi tiết
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {["week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  selectedPeriod === period
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {period === "week"
                  ? "Tuần"
                  : period === "month"
                    ? "Tháng"
                    : "Năm"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        key={selectedPeriod}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-primary to-primary/70 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <LineChart className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
              +{currentData.growth}%
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {(currentData.total / 1000000000).toFixed(1)}B ₫
          </p>
          <p className="text-sm opacity-90">Tổng doanh thu</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {(currentData.avgPerFlight / 1000000).toFixed(1)}M ₫
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Trung bình/chuyến
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold mb-1 text-green-600">
            +{currentData.growth}%
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tăng trưởng
          </p>
        </div>
      </motion.div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Phân bổ doanh thu</h3>
        <div className="space-y-4">
          {breakdownData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{item.category}</span>
                <span className="text-slate-500">{item.percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  />
                </div>
                <span className="font-bold w-32 text-right">
                  {(item.amount / 1000000000).toFixed(1)}B ₫
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
