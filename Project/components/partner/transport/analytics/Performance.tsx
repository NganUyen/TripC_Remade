"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  Star,
  MapPin,
  Users,
  Bus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface PerformanceData {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  avgRating: number;
  onTimeRate: number;
  avgOccupancy: number;
  topRoutes: Array<{
    origin: string;
    destination: string;
    count: number;
  }>;
}

export function Performance() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData>({
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    avgRating: 0,
    onTimeRate: 0,
    avgOccupancy: 0,
    topRoutes: [],
  });
  const [period, setPeriod] = useState<"week" | "month" | "year">("year");

  const { supabaseUser } = useCurrentUser();
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (supabaseUser) {
      fetchPerformanceData();
    }
  }, [period, supabaseUser]);

  const refreshProviders = async () => {
    if (!supabaseUser) return [];
    try {
      const resp = await fetch("/api/partner/transport/providers", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const result = await resp.json();
      if (result.success) {
        setProviders(result.data || []);
        return result.data || [];
      }
    } catch (error) {
      console.error("Error refreshing providers:", error);
    }
    return [];
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      if (!supabaseUser) return;

      const myProviders = await refreshProviders();
      if (myProviders.length === 0) { setLoading(false); return; }
      const providerIds = myProviders.map((p: any) => p.id);

      // 1. Get this provider's routes (for origin/destination lookup)
      const { data: routes } = await supabase
        .from("transport_routes")
        .select("id, origin, destination, vehicle_type, seats_available, total_capacity")
        .in("provider_id", providerIds);

      const routeMap = new Map((routes || []).map((r) => [r.id, r]));

      // 2. Fetch confirmed bookings securely via API (bypasses RLS)
      const bookingsResp = await fetch("/api/partner/transport/bookings", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const bookingsResult = await bookingsResp.json();
      const bookings: any[] = bookingsResult.success ? bookingsResult.data : [];

      // 3. Total = ALL-TIME, period = filter
      const now = new Date();
      const startDate = new Date();
      if (period === "week") startDate.setDate(now.getDate() - 7);
      else if (period === "month") startDate.setMonth(now.getMonth() - 1);
      else startDate.setFullYear(now.getFullYear() - 1);

      // ALL-TIME confirmed for occupancy
      const allConfirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
      // Period bookings for trip counts
      const periodBookings = bookings.filter((b) => new Date(b.created_at) >= startDate);

      const total = allConfirmed.length; // all-time total
      const completed = allConfirmed.filter((b) => b.status === "completed").length;
      const cancelled = bookings.filter((b) => b.status === "cancelled" && new Date(b.created_at) >= startDate).length;

      // 4. Get reviews
      const { data: reviews } = await supabase
        .from("transport_reviews")
        .select("rating")
        .in("provider_id", providerIds.length > 0 ? providerIds : [null]);

      const ratings = (reviews || []).map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      // 5. Top routes — use allConfirmed to maximize data
      const routeCounts: Record<string, { origin: string; destination: string; count: number }> = {};
      allConfirmed.forEach((booking) => {
        const meta = booking.metadata || {};
        const routeId = meta.routeId || meta.metadata?.routeId;
        const route = routeId ? routeMap.get(routeId) : null;
        if (route) {
          const key = `${route.origin}-${route.destination}`;
          routeCounts[key] = routeCounts[key] || { origin: route.origin, destination: route.destination, count: 0 };
          routeCounts[key].count++;
        } else {
          // Fallback: try pickup/dropoff fields in metadata
          const origin = meta.pickupLocation || meta.origin;
          const destination = meta.dropoffLocation || meta.destination;
          if (origin && destination) {
            const key = `${origin}-${destination}`;
            routeCounts[key] = routeCounts[key] || { origin, destination, count: 0 };
            routeCounts[key].count++;
          }
        }
      });
      const topRoutes = Object.values(routeCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      // 6. Occupancy from allConfirmed
      let totalCapacity = 0;
      let totalBooked = 0;
      const confirmedByRoute = new Map<string, number>();
      allConfirmed.forEach((b) => {
        const meta = b.metadata || {};
        const rid = meta.routeId || meta.metadata?.routeId;
        if (rid) confirmedByRoute.set(rid, (confirmedByRoute.get(rid) || 0) + (meta.passengerCount || meta.metadata?.passengerCount || 1));
      });

      (routes || []).forEach((route) => {
        const getSeatCapacityFallback = (vt: string) => {
          const t = vt.toLowerCase();
          if (t.includes("45")) return 45;
          if (t.includes("35")) return 35;
          if (t.includes("29")) return 29;
          if (t.includes("16")) return 16;
          if (t.includes("9") || t.includes("limousine")) return 9;
          if (t.includes("7")) return 7;
          if (t.includes("4")) return 4;
          return 29;
        };
        const cap = (route.total_capacity > 0) ? route.total_capacity : getSeatCapacityFallback(route.vehicle_type);
        totalCapacity += cap;
        totalBooked += confirmedByRoute.get(route.id) || 0;
      });

      const avgOccupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

      setData({
        totalTrips: total,
        completedTrips: completed,
        cancelledTrips: cancelled,
        avgRating,
        onTimeRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgOccupancy,
        topRoutes,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Tổng chuyến",
      value: data.totalTrips,
      icon: Bus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up",
      change: "Mới",
    },
    {
      label: "Hoàn thành",
      value: data.completedTrips,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "up",
      change: "Mới",
    },
    {
      label: "Đã hủy",
      value: data.cancelledTrips,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down",
      change: "Mới",
    },
    {
      label: "Đánh giá",
      value: data.avgRating,
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "up",
      change: "Mới",
    },
    {
      label: "Đúng giờ",
      value: `${data.onTimeRate}%`,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: "up",
      change: "Mới",
    },
    {
      label: "Lấp đầy",
      value: `${data.avgOccupancy}%`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
      change: "Mới",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Hiệu suất Hoạt động
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Phân tích dữ liệu vận hành thời gian thực
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-center">
          {(["week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${period === p
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
            >
              {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className={`p-3 ${stat.bgColor} rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                {stat.label}
              </p>
              <div
                className={`flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {stat.change === "Mới" ? "" : stat.change}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Top Routes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Tuyến đường phổ biến
          </h2>
        </div>
        {data.topRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topRoutes.map((route, index) => (
              <motion.div
                key={`${route.origin}-${route.destination}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm group-hover:scale-110 transition-all">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {route.origin} → {route.destination}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-primary rounded-full h-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(route.count / (data.topRoutes[0]?.count || 1)) * 100}%`,
                      }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                    />
                  </div>
                </div>
                <div className="text-right pl-4">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {route.count}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    chuyến
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            Chưa có dữ liệu tuyến đường
          </div>
        )}
      </div>

      {/* Performance Chart - real bar chart from top routes */}
      {!loading && data.topRoutes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Biểu đồ chuyến theo tuyến</h2>
          </div>
          <div className="flex items-end gap-3 h-36">
            {data.topRoutes.map((route, i) => {
              const maxCount = data.topRoutes[0]?.count || 1;
              const barH = (route.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full" style={{ height: '120px', display: 'flex', alignItems: 'flex-end' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap bg-slate-800 text-white text-[10px] rounded px-2 py-1">
                      {route.count} chuyến
                    </div>
                    <motion.div
                      className="w-full bg-primary/80 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${barH}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold text-center leading-tight">
                    {route.origin.split(' ')[0]}→{route.destination.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
