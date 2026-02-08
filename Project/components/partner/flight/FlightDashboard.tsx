"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Plane,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: "up" | "down";
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    </motion.div>
  );
}

interface FlightDashboardProps {
  partnerId: string;
}

export default function FlightDashboard({ partnerId }: FlightDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [partnerId]);

  async function fetchMetrics() {
    try {
      const response = await fetch("/api/partner/flight/analytics/dashboard", {
        headers: {
          "x-partner-id": partnerId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMetrics(result.data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      title: "Doanh thu tháng này",
      value: metrics
        ? `${(metrics.revenue.total / 100).toLocaleString()} VNĐ`
        : "0 VNĐ",
      change: 12.5,
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "Đặt vé hôm nay",
      value: metrics ? metrics.bookings.total.toString() : "0",
      change: 8.3,
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Chuyến bay hoạt động",
      value: metrics ? metrics.flights.active.toString() : "0",
      change: 4.1,
      icon: Plane,
      trend: "up" as const,
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: "82%",
      change: 6.2,
      icon: Activity,
      trend: "up" as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Tổng quan hoạt động kinh doanh
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Hoạt động gần đây
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Đặt vé mới - VN123
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  5 phút trước
                </p>
              </div>
            </div>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              +2.5M VNĐ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
