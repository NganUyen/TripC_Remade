"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState("month");

  const metrics = [
    {
      label: "Đúng giờ",
      value: "92.5%",
      change: "+2.3%",
      icon: CheckCircle,
      color: "green",
      description: "Chuyến bay khởi hành đúng giờ",
    },
    {
      label: "Thời gian chờ TB",
      value: "12 phút",
      change: "-3 phút",
      icon: Clock,
      color: "blue",
      description: "Thời gian chờ trung bình của hành khách",
    },
    {
      label: "Hành khách hài lòng",
      value: "4.6/5",
      change: "+0.2",
      icon: TrendingUp,
      color: "purple",
      description: "Đánh giá hài lòng trung bình",
    },
    {
      label: "Tỷ lệ hủy chuyến",
      value: "1.2%",
      change: "-0.5%",
      icon: AlertCircle,
      color: "orange",
      description: "Chuyến bay bị hủy",
    },
  ];

  const performanceByRoute = [
    {
      route: "HAN - SGN",
      onTime: 95,
      avgDelay: 8,
      cancellation: 0.8,
      satisfaction: 4.7,
    },
    {
      route: "SGN - DAD",
      onTime: 91,
      avgDelay: 14,
      cancellation: 1.2,
      satisfaction: 4.6,
    },
    {
      route: "HAN - DAD",
      onTime: 93,
      avgDelay: 10,
      cancellation: 1.0,
      satisfaction: 4.5,
    },
    {
      route: "SGN - PQC",
      onTime: 88,
      avgDelay: 18,
      cancellation: 1.8,
      satisfaction: 4.4,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Chỉ số Hiệu suất
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Theo dõi chất lượng dịch vụ
          </p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                timeframe === period
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-3">
              <metric.icon className={`w-8 h-8 text-${metric.color}-500`} />
              <span
                className={`text-sm font-semibold ${
                  metric.change.startsWith("+") ||
                  (metric.change.startsWith("-") &&
                    parseFloat(metric.change) < 0)
                    ? "text-green-600"
                    : "text-slate-500"
                }`}
              >
                {metric.change}
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              {metric.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {metric.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Performance by Route */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Hiệu suất theo tuyến</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4">Tuyến bay</th>
                <th className="text-left py-3 px-4">Đúng giờ</th>
                <th className="text-left py-3 px-4">Trễ TB (phút)</th>
                <th className="text-left py-3 px-4">Tỷ lệ hủy</th>
                <th className="text-left py-3 px-4">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {performanceByRoute.map((route, index) => (
                <motion.tr
                  key={route.route}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-semibold">{route.route}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        route.onTime >= 90
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {route.onTime}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{route.avgDelay}</td>
                  <td className="py-3 px-4">{route.cancellation}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {route.satisfaction}
                      </span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
