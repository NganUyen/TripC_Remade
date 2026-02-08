/**
 * Enhanced Hotel Dashboard Component
 * Fetches and displays real-time partner metrics
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Hotel,
  Users,
  AlertCircle,
} from 'lucide-react';

interface DashboardMetrics {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  gross_revenue_cents: number;
  net_revenue_cents: number;
  active_hotels: number;
  total_reviews: number;
  period_start: string;
  period_end: string;
  gross_revenue?: string;
  net_revenue?: string;
  avg_booking_value?: string;
  confirmation_rate?: number;
  cancellation_rate?: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  loading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

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
        {change !== undefined && trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    </motion.div>
  );
}

export function EnhancedHotelDashboard({ partnerId }: { partnerId: string }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/partner/hotel/analytics/dashboard', {
          headers: {
            'x-partner-id': partnerId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const result = await response.json();
        if (result.success) {
          setMetrics(result.data);
        } else {
          throw new Error(result.error?.message || 'Unknown error');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [partnerId]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-semibold text-red-800 dark:text-red-200">
            Error loading dashboard
          </p>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue (30 days)',
      value: metrics?.gross_revenue || '$0',
      icon: DollarSign,
      loading,
    },
    {
      title: 'Net Revenue (30 days)',
      value: metrics?.net_revenue || '$0',
      icon: TrendingUp,
      loading,
    },
    {
      title: 'Total Bookings',
      value: metrics?.total_bookings || 0,
      icon: Calendar,
      loading,
    },
    {
      title: 'Active Hotels',
      value: metrics?.active_hotels || 0,
      icon: Hotel,
      loading,
    },
    {
      title: 'Confirmation Rate',
      value: metrics?.confirmation_rate ? `${metrics.confirmation_rate}%` : '0%',
      icon: Users,
      loading,
    },
    {
      title: 'Total Reviews',
      value: metrics?.total_reviews || 0,
      icon: Star,
      loading,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Partner Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {metrics ? (
            <>
              Performance overview for the last 30 days (
              {new Date(metrics.period_start).toLocaleDateString()} -{' '}
              {new Date(metrics.period_end).toLocaleDateString()})
            </>
          ) : (
            'Loading performance metrics...'
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Revenue Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Gross Revenue
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metrics.gross_revenue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Net Revenue
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metrics.net_revenue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Avg Booking Value
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metrics.avg_booking_value}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Booking Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Booking Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Confirmed
                </span>
                <span className="font-semibold text-green-600">
                  {metrics.confirmed_bookings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Cancelled
                </span>
                <span className="font-semibold text-red-600">
                  {metrics.cancelled_bookings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Cancellation Rate
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metrics.cancellation_rate}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
