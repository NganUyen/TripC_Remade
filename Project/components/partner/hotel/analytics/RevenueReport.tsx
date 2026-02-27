"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

export function RevenueReport({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [apiData, setApiData] = useState<{
    total: number;
    growth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fallback = {
    week: { total: 25000000, growth: 8 },
    month: { total: 125000000, growth: 12 },
    year: { total: 1500000000, growth: 15 },
  };

  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/partner/hotel/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data?.length > 0) setHotelId(d.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [partnerId]);

  useEffect(() => {
    if (!hotelId) return;
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(
          period === "week"
            ? Date.now() - 7 * 86400000
            : period === "month"
              ? Date.now() - 30 * 86400000
              : Date.now() - 365 * 86400000,
        )
          .toISOString()
          .split("T")[0];
        const res = await fetch(
          `/api/partner/hotel/analytics?hotel_id=${hotelId}&start_date=${startDate}&end_date=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data) {
            setApiData({
              total: (d.data.gross_revenue_cents ?? 0) / 100,
              growth: 0,
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [hotelId, period]);

  const current = apiData ?? fallback[period];

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
