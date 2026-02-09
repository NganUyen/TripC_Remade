"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Bus,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Ticket,
  Users,
  Route,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: "up" | "down";
  loading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  loading,
}: StatCardProps) {
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
        {loading ? (
          <span className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-8 w-20 inline-block" />
        ) : (
          value
        )}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    </motion.div>
  );
}

interface Booking {
  id: string;
  booking_code: string;
  status: string;
  total_amount: number;
  created_at: string;
  passenger_info: {
    name?: string;
    phone?: string;
  };
  transport_routes?: {
    origin: string;
    destination: string;
    departure_time: string;
  };
}

interface DashboardStats {
  totalRevenue: number;
  todayTrips: number;
  occupancyRate: number;
  averageRating: number;
}

export function TransportDashboard() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayTrips: 0,
    occupancyRate: 0,
    averageRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch transport bookings with route info
      // Try new unified schema first (with category filter)
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
                    id,
                    booking_code,
                    status,
                    total_amount,
                    created_at,
                    passenger_info,
                    guest_details,
                    metadata,
                    title,
                    location_summary
                `,
        )
        .eq("category", "transport")
        .order("created_at", { ascending: false })
        .limit(5);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        // Try old schema with route_id foreign key
        const { data: legacyBookings, error: legacyError } = await supabase
          .from("bookings")
          .select(
            `
                        id,
                        booking_code,
                        status,
                        total_amount,
                        created_at,
                        passenger_info,
                        route_id,
                        transport_routes!route_id (
                            origin,
                            destination,
                            departure_time
                        )
                    `,
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (!legacyError) {
          setRecentBookings((legacyBookings as unknown as Booking[]) || []);
        }
      } else {
        setRecentBookings((bookings as unknown as Booking[]) || []);
      }

      // Calculate stats - Try to filter for transport bookings
      let allBookings = null;

      // Try with category filter (unified schema)
      const { data: newSchemaBookings } = await supabase
        .from("bookings")
        .select("total_amount, status, category")
        .eq("status", "confirmed")
        .eq("category", "transport");

      if (newSchemaBookings && newSchemaBookings.length > 0) {
        allBookings = newSchemaBookings;
      } else {
        // Fall back to all bookings if no category column or no transport bookings
        const { data: legacyBookings } = await supabase
          .from("bookings")
          .select("total_amount, status")
          .eq("status", "confirmed")
          .not("route_id", "is", null); // Only bookings with routes

        allBookings = legacyBookings;
      }

      const totalRevenue =
        allBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      // Get today's trips
      const today = new Date().toISOString().split("T")[0];
      const { count: todayTrips } = await supabase
        .from("transport_routes")
        .select("id", { count: "exact", head: true })
        .gte("departure_time", today)
        .lt(
          "departure_time",
          new Date(Date.now() + 86400000).toISOString().split("T")[0],
        );

      // Get routes for occupancy calculation
      const { data: routes } = await supabase
        .from("transport_routes")
        .select("seats_available, vehicle_type");

      let totalCapacity = 0;
      let totalAvailable = 0;

      routes?.forEach((route) => {
        const available = route.seats_available || 0;
        totalAvailable += available;

        // Estimate capacity based on generic vehicle type strings if parsing fails,
        // but fleet/route management uses specific strings like "29 seats"
        const type = route.vehicle_type?.toLowerCase() || "";
        let capacity = 0;

        if (type.includes("4 seats")) capacity = 4;
        else if (type.includes("7 seats")) capacity = 7;
        else if (type.includes("9 seats")) capacity = 9;
        else if (type.includes("16 seats")) capacity = 16;
        else if (type.includes("29 seats")) capacity = 29;
        else if (type.includes("35 seats")) capacity = 35;
        else if (type.includes("45 seats")) capacity = 45;
        else if (type.includes("limousine"))
          capacity = 9; // Default limousine
        else if (type.includes("bus"))
          capacity = 45; // Default bus
        else capacity = available + 10; // Fallback if unknown, assume some occupancy

        totalCapacity += capacity;
      });

      const occupancyRate =
        totalCapacity > 0
          ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100)
          : 0;

      // Get average rating
      const { data: reviews } = await supabase.from("reviews").select("rating");

      const avgRating = reviews?.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalRevenue,
        todayTrips: todayTrips || 0,
        occupancyRate,
        averageRating: avgRating || 0, // Default to 0 if no reviews
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VNĐ`;
    }
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      confirmed: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        label: "Đã xác nhận",
      },
      held: {
        bg: "bg-amber-100 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-400",
        label: "Đang giữ chỗ",
      },
      cancelled: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        label: "Đã hủy",
      },
      completed: {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        label: "Hoàn thành",
      },
      payment_failed: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        label: "Thanh toán lỗi",
      },
    };

    const config = statusConfig[status] || statusConfig.held;
    return (
      <span
        className={`px-2 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const dashboardStats = [
    {
      title: "Doanh thu tổng",
      value: formatCurrency(stats.totalRevenue),
      change: 15.2,
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "Chuyến xe hôm nay",
      value: stats.todayTrips.toString(),
      change: 8.5,
      icon: Bus,
      trend: "up" as const,
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: `${stats.occupancyRate}%`,
      change: 5.3,
      icon: Ticket,
      trend: "up" as const,
    },
    {
      title: "Đánh giá trung bình",
      value:
        stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : "N/A",
      change: 0.2,
      icon: Star,
      trend: "up" as const,
    },
  ];

  const quickActions = [
    {
      label: "Tạo tuyến mới",
      icon: Route,
      path: "/partner/transport/operations",
    },
    {
      label: "Quản lý đặt chỗ",
      icon: Ticket,
      path: "/partner/transport/bookings",
    },
    {
      label: "Cập nhật giá",
      icon: DollarSign,
      path: "/partner/transport/operations",
    },
    {
      label: "Xem báo cáo",
      icon: TrendingUp,
      path: "/partner/transport/reports",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard Vận tải
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Tổng quan hoạt động và hiệu suất của dịch vụ vận tải
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:border-primary/20 border border-slate-200 dark:border-slate-700 transition-all text-left"
              >
                <action.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Đặt chỗ gần đây
          </h3>
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse"
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                </div>
              ))
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {booking.passenger_info?.name ||
                        booking.booking_code ||
                        "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {booking.transport_routes
                        ? `${(booking.transport_routes as any).origin} → ${(booking.transport_routes as any).destination}`
                        : "Chưa có thông tin tuyến"}{" "}
                      • {formatDate(booking.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Chưa có đặt chỗ nào
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
