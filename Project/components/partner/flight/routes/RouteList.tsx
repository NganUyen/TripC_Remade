/**
 * Route List Component
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Route, Plus } from 'lucide-react';

interface RouteListProps {
  partnerId: string;
}

export default function RouteList({ partnerId }: RouteListProps) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, [partnerId]);

  async function fetchRoutes() {
    try {
      const response = await fetch('/api/partner/flight/routes', {
        headers: {
          'x-partner-id': partnerId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRoutes(result.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quản lý Tuyến bay
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý các tuyến bay của hãng
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          Thêm tuyến
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        {loading ? (
          <p className="text-center py-12 text-slate-500">Đang tải...</p>
        ) : routes.length === 0 ? (
          <div className="text-center py-12">
            <Route className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có tuyến bay
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Thêm tuyến bay đầu tiên
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {route.origin} → {route.destination}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {route.distance_km} km - {route.duration_minutes} phút
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
