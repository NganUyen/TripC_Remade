"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plane, Users, DollarSign, Calendar } from "lucide-react";

interface RouteMetrics {
  route: string;
  flights: number;
  passengers: number;
  revenue: number;
  occupancy: number;
}

export default function RouteAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const routeMetrics: RouteMetrics[] = [
    {
      route: "HAN - SGN",
      flights: 120,
      passengers: 18500,
      revenue: 92500000000,
      occupancy: 85,
    },
    {
      route: "SGN - DAD",
      flights: 90,
      passengers: 12500,
      revenue: 62500000000,
      occupancy: 78,
    },
    {
      route: "HAN - DAD",
      flights: 75,
      passengers: 10200,
      revenue: 51000000000,
      occupancy: 82,
    },
    {
      route: "SGN - PQC",
      flights: 60,
      passengers: 8500,
      revenue: 42500000000,
      occupancy: 75,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Phân tích Tuyến bay
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Thống kê hiệu suất các tuyến bay
          </p>
        </div>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng chuyến bay",
            value: "345",
            icon: Plane,
            color: "blue",
          },
          {
            label: "Tổng hành khách",
            value: "49,700",
            icon: Users,
            color: "green",
          },
          {
            label: "Doanh thu",
            value: "248.5B ₫",
            icon: DollarSign,
            color: "purple",
          },
          {
            label: "Tỷ lệ lấp đầy",
            value: "80%",
            icon: TrendingUp,
            color: "orange",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`w-10 h-10 text-${metric.color}-500`} />
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Route Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Hiệu suất theo tuyến</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4">Tuyến bay</th>
                <th className="text-left py-3 px-4">Chuyến bay</th>
                <th className="text-left py-3 px-4">Hành khách</th>
                <th className="text-left py-3 px-4">Doanh thu</th>
                <th className="text-left py-3 px-4">Tỷ lệ lấp đầy</th>
              </tr>
            </thead>
            <tbody>
              {routeMetrics.map((route, index) => (
                <motion.tr
                  key={route.route}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-semibold">{route.route}</td>
                  <td className="py-3 px-4">{route.flights}</td>
                  <td className="py-3 px-4">
                    {route.passengers.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3 px-4">
                    {(route.revenue / 1000000000).toFixed(1)}B ₫
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${route.occupancy}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {route.occupancy}%
                      </span>
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
