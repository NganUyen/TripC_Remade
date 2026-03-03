"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plane,
  Clock,
} from "lucide-react";

interface FlightScheduleItem {
  id: string;
  date: string;
  flightNumber: string;
  route: string;
  departure: string;
  arrival: string;
  status: "scheduled" | "departed" | "arrived" | "cancelled";
}

export default function FlightSchedule({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [schedules, setSchedules] = useState<FlightScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const dateStr = currentDate.toISOString().split("T")[0];
        const res = await fetch(`/api/partner/flight/flights?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSchedules(
              (data.data || []).map((f: any) => ({
                id: f.id,
                date: f.departure_time?.split("T")[0] ?? dateStr,
                flightNumber: f.flight_number,
                route: `${f.origin_code ?? f.origin} - ${f.destination_code ?? f.destination}`,
                departure: f.departure_time
                  ? new Date(f.departure_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
                arrival: f.arrival_time
                  ? new Date(f.arrival_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
                status: f.status ?? "scheduled",
              })),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [partnerId, currentDate]);

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "departed":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "arrived":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Lịch bay
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý lịch trình chuyến bay
        </p>
      </div>

      {/* Date Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button
            onClick={previousDay}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-bold">
              {currentDate.toLocaleDateString("vi-VN", { weekday: "long" })}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentDate.toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={nextDay}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Flight Schedule List */}
      <div className="space-y-3">
        {schedules.map((flight, index) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{flight.flightNumber}</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {flight.route}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Khởi hành
                  </p>
                  <p className="text-xl font-bold">{flight.departure}</p>
                </div>
                <div className="text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Đến
                  </p>
                  <p className="text-xl font-bold">{flight.arrival}</p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(flight.status)}`}
              >
                {flight.status === "scheduled" && "Đã lên lịch"}
                {flight.status === "departed" && "Đã khởi hành"}
                {flight.status === "arrived" && "Đã đến"}
                {flight.status === "cancelled" && "Đã hủy"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
