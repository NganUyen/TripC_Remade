"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { PieChart, Plane, Users, Percent } from "lucide-react";

interface CapacityData {
  route: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  occupancyRate: number;
}

export default function CapacityReport({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetch("/api/partner/flight/routes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setCapacityData(
              data.data.map((r: any) => {
                const totalSeats = r.total_seats ?? 0;
                const bookedSeats =
                  r.booked_seats ??
                  Math.round(totalSeats * ((r.avg_occupancy ?? 0) / 100));
                const availableSeats = totalSeats - bookedSeats;
                const occupancyRate =
                  totalSeats > 0
                    ? Math.round((bookedSeats / totalSeats) * 100)
                    : 0;
                return {
                  route: `${r.origin_code} - ${r.destination_code}`,
                  totalSeats,
                  bookedSeats,
                  availableSeats,
                  occupancyRate,
                };
              }),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [partnerId]);

  const totalSeats = capacityData.reduce((sum, d) => sum + d.totalSeats, 0);
  const totalBooked = capacityData.reduce((sum, d) => sum + d.bookedSeats, 0);
  const avgOccupancy =
    totalSeats > 0 ? ((totalBooked / totalSeats) * 100).toFixed(1) : "0.0";

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (rate >= 60)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Báo cáo Công suất
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Phân tích tỷ lệ lấp đầy và sử dụng ghế
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng ghế",
            value: totalSeats.toLocaleString("vi-VN"),
            icon: Plane,
            color: "blue",
          },
          {
            label: "Đã đặt",
            value: totalBooked.toLocaleString("vi-VN"),
            icon: Users,
            color: "green",
          },
          {
            label: "Còn trống",
            value: (totalSeats - totalBooked).toLocaleString("vi-VN"),
            icon: Plane,
            color: "orange",
          },
          {
            label: "Tỷ lệ TB",
            value: `${avgOccupancy}%`,
            icon: Percent,
            color: "purple",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <metric.icon className={`w-8 h-8 text-${metric.color}-500 mb-3`} />
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Capacity by Route */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Công suất theo tuyến</h3>
        <div className="space-y-4">
          {capacityData.map((data, index) => (
            <motion.div
              key={data.route}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{data.route}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {data.bookedSeats.toLocaleString("vi-VN")} /{" "}
                    {data.totalSeats.toLocaleString("vi-VN")} ghế
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getOccupancyColor(data.occupancyRate)}`}
                >
                  {data.occupancyRate}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.occupancyRate}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      data.occupancyRate >= 80
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : data.occupancyRate >= 60
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Đã đặt: {data.bookedSeats.toLocaleString("vi-VN")}
                  </span>
                  <span>
                    Còn trống: {data.availableSeats.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Occupancy Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Chú thích</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded" />
            <span className="text-sm">≥ 80%: Rất tốt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded" />
            <span className="text-sm">60-79%: Tốt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded" />
            <span className="text-sm">&lt; 60%: Cần cải thiện</span>
          </div>
        </div>
      </div>
    </div>
  );
}
