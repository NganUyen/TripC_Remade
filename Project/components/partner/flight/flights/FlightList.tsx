/**
 * Flight List Component
 * Displays and manages partner's flights
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Plus, Search, Filter } from "lucide-react";

interface FlightListProps {
  partnerId: string;
}

export default function FlightList({ partnerId }: FlightListProps) {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlights();
  }, [partnerId]);

  async function fetchFlights() {
    try {
      setLoading(true);
      const response = await fetch("/api/partner/flight/flights", {
        headers: {
          "x-partner-id": partnerId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFlights(result.data);
      } else {
        throw new Error("Failed to fetch flights");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Danh sách Chuyến bay
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Danh sách Chuyến bay
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý các chuyến bay của hãng
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Thêm chuyến bay
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chuyến bay..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </button>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có chuyến bay
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Thêm chuyến bay đầu tiên để bắt đầu
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {flight.flight_number}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {flight.origin} → {flight.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(flight.departure_at).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        flight.status === "scheduled"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {flight.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
