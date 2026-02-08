"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

export function RevenueReport() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const revenueData = {
    week: { total: 25000000, growth: 8 },
    month: { total: 125000000, growth: 12 },
    year: { total: 1500000000, growth: 15 },
  };

  const current = revenueData[period];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Doanh thu
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Phân tích doanh thu và lợi nhuận
        </p>
      </div>

      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              period === p
                ? "bg-primary text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
          </button>
        ))}
      </div>

      <motion.div
        key={period}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Tổng doanh thu
            </p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              {current.total.toLocaleString("vi-VN")} VNĐ
            </h2>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-6 h-6" />
            <span className="text-2xl font-bold">+{current.growth}%</span>
          </div>
        </div>
        <div className="h-48 bg-gradient-to-t from-primary/20 to-transparent rounded-xl" />
      </motion.div>
    </div>
  );
}
