"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Armchair, Search, MapPin, Clock, Users, Check, X } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface RouteSeats {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  vehicle_type: string;
  type: string;
  seats_available: number;
  total_capacity: number;   // real capacity from DB (or derived fallback)
  booked_count: number;     // computed from confirmed bookings
  provider_name?: string;
}

/** Derive capacity from vehicle_type string (sorted by length to avoid '9' matching '29') */
const getSeatCapacityFallback = (vehicleType: string): number => {
  const capacities: Record<string, number> = {
    "45 seats": 45, "35 seats": 35, "29 seats": 29, "16 seats": 16,
    "9 seats": 9, "7 seats": 7, "4 seats": 4,
    limousine: 9, "xe 29 chỗ": 29, "29 chỗ": 29, "9 chỗ": 9,
    "limousine 9 chỗ": 9, "limousine 9 seats": 9,
  };
  const type = (vehicleType || "").toLowerCase();
  const keys = Object.keys(capacities).sort((a, b) => b.length - a.length);
  for (const key of keys) if (type.includes(key)) return capacities[key];
  return 29;
};

export function SeatManagement() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteSeats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteSeats | null>(null);

  const { supabaseUser } = useCurrentUser();
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (supabaseUser) {
      fetchRoutes();
    }
  }, [supabaseUser]);

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

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      if (!supabaseUser) return;

      const myProviders = await refreshProviders();
      if (myProviders.length === 0) { setRoutes([]); setLoading(false); return; }
      const providerIds = myProviders.map((p: any) => p.id);

      // 1. Fetch routes (include total_capacity if the column exists)
      const { data, error } = await supabase
        .from("transport_routes")
        .select(`id, origin, destination, departure_time, vehicle_type, type, seats_available, total_capacity, transport_providers(name)`)
        .in("provider_id", providerIds)
        .order("departure_time", { ascending: true });

      if (error) { console.error("Error fetching routes:", error); setLoading(false); return; }

      // 2. Fetch confirmed bookings to count booked seats per route
      const bookingsResp = await fetch("/api/partner/transport/bookings", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const bookingsResult = await bookingsResp.json();
      const confirmed = (bookingsResult.success ? bookingsResult.data : []).filter(
        (b: any) => b.status === "confirmed" || b.status === "completed"
      );

      const formattedData = (data || []).map((item: any) => {
        // Count passengers booked for this specific route
        const booked = confirmed.reduce((sum: number, b: any) => {
          const meta = b.metadata || {};
          const rid = meta.routeId || meta.metadata?.routeId;
          if (rid === item.id) return sum + (meta.passengerCount || meta.metadata?.passengerCount || 1);
          return sum;
        }, 0);

        // Use DB total_capacity if already set (>0), otherwise fall back to vehicle type
        const cap: number = (item.total_capacity > 0)
          ? item.total_capacity
          : getSeatCapacityFallback(item.vehicle_type);

        return {
          ...item,
          provider_name: (item.transport_providers as any)?.name,
          total_capacity: cap,
          booked_count: booked,
          seats_available: Math.max(0, cap - booked),
        };
      });

      setRoutes(formattedData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * updateCapacity: Partner adjusts the TOTAL vehicle capacity by +1 or -1.
   * - Booked seats (confirmed bookings) are ALWAYS preserved.
   * - seats_available = new_total_capacity - booked_count.
   * - Cannot reduce capacity below number of already booked seats.
   */
  const updateCapacity = async (route: RouteSeats, delta: number) => {
    if (!supabaseUser) return;
    const booked = route.booked_count ?? 0;
    const newCap = Math.max(booked, route.total_capacity + delta);
    const newAvail = newCap - booked;
    try {
      const resp = await fetch(`/api/partner/transport/routes/${route.id}/seats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": supabaseUser.id },
        body: JSON.stringify({ total_capacity: newCap, seats_available: newAvail }),
      });
      const result = await resp.json();
      if (!resp.ok || !result.success) {
        console.error("Error updating capacity:", result.error);
      } else {
        // Optimistic update — avoids full refetch for snappy UX
        setRoutes((prev) => prev.map((r) =>
          r.id === route.id ? { ...r, total_capacity: newCap, seats_available: newAvail } : r
        ));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bus: "Xe buýt",
      limousine: "Limousine",
      private_car: "Xe riêng",
      train: "Tàu",
      airplane: "Máy bay",
    };
    return labels[type] || type;
  };

  // Use route.total_capacity which is already resolved in fetchRoutes

  const getOccupancyColor = (available: number, total: number) => {
    const occupancy = ((total - available) / total) * 100;
    if (occupancy >= 90) return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (occupancy >= 70)
      return "text-amber-600 bg-amber-100 dark:bg-amber-900/20";
    return "text-green-600 bg-green-100 dark:bg-green-900/20";
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats from real DB data
  const totalSeats = routes.reduce((sum, r) => sum + (r.total_capacity || 0), 0);
  const availableSeats = routes.reduce((sum, r) => sum + r.seats_available, 0);
  const totalBooked = routes.reduce((sum, r) => sum + (r.booked_count || 0), 0);
  const occupancyRate = totalSeats > 0
    ? ((totalBooked / totalSeats) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3.5 bg-blue-500/10 rounded-2xl">
          <Armchair className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Quản lý Ghế
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Giám sát và tối ưu hóa hệ tầng phân bổ chỗ ngồi thời gian thực
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Tổng số chuyến",
            value: routes.length,
            icon: MapPin,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Tổng số ghế",
            value: totalSeats,
            icon: Armchair,
            color: "text-blue-600",
            bg: "bg-blue-600/10",
          },
          {
            label: "Ghế trống",
            value: availableSeats,
            icon: Users,
            color: "text-green-600",
            bg: "bg-green-600/10",
          },
          {
            label: "Tỷ lệ lấp đầy",
            value: `${occupancyRate}%`,
            icon: Check,
            color: "text-amber-600",
            bg: "bg-amber-600/10",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 ${stat.bg} rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tuyến đường..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* Seats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            </div>
          ))}
        </div>
      ) : filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route, index) => {
            const capacity = route.total_capacity || getSeatCapacityFallback(route.vehicle_type);
            const bookedSeats = route.booked_count ?? (capacity - route.seats_available);

            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                {/* Route Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {route.origin} → {route.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(route.departure_time)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                      {getVehicleTypeLabel(route.type)} - {route.vehicle_type}
                    </span>
                  </div>
                </div>

                {/* Seat Map Visualization */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Sơ đồ ghế
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getOccupancyColor(route.seats_available, capacity)}`}
                    >
                      {route.seats_available}/{capacity} trống
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: capacity }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${i < bookedSeats
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : "bg-green-500/10 text-green-600 border border-green-500/20"
                          }`}
                      >
                        <Armchair className="w-3.5 h-3.5" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/30 rounded-full" />
                      Trống
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 rounded-full" />
                      Đã đặt
                    </span>
                  </div>
                </div>

                {/* Quick Actions — adjusts TOTAL capacity, not just available */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center">
                    {bookedSeats} đã đặt / {capacity} tổng ghế &bull; {route.seats_available} trống
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCapacity(route, -1)}
                      disabled={capacity <= bookedSeats}  // cannot go below booked
                      className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-red-600 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                      − Bỏ 1 ghế
                    </button>
                    <button
                      onClick={() => updateCapacity(route, +1)}
                      className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-green-600 bg-green-500/5 hover:bg-green-500/10 rounded-2xl transition-all active:scale-95"
                    >
                      + Thêm 1 ghế
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <Armchair className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Không có chuyến xe nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Thêm tuyến đường để bắt đầu quản lý ghế
          </p>
        </div>
      )}
    </div>
  );
}
