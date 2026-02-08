'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DynamicPriceData {
  route: string;
  currentPrice: number;
  basePrice: number;
  demandLevel: 'low' | 'medium' | 'high';
  occupancyRate: number;
  priceChange: number;
  recommendedPrice: number;
}

export default function DynamicPricing() {
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [priceData] = useState<DynamicPriceData[]>([
    {
      route: 'HAN - SGN',
      currentPrice: 2400000,
      basePrice: 2000000,
      demandLevel: 'high',
      occupancyRate: 85,
      priceChange: 20,
      recommendedPrice: 2500000
    },
    {
      route: 'SGN - DAD',
      currentPrice: 1500000,
      basePrice: 1600000,
      demandLevel: 'low',
      occupancyRate: 45,
      priceChange: -6.25,
      recommendedPrice: 1400000
    },
    {
      route: 'HAN - DAD',
      currentPrice: 1800000,
      basePrice: 1800000,
      demandLevel: 'medium',
      occupancyRate: 68,
      priceChange: 0,
      recommendedPrice: 1850000
    }
  ]);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Giá Động
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Tự động điều chỉnh giá theo cầu và công suất
          </p>
        </div>
        <label className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
          <span className="text-sm font-medium">Tự động điều chỉnh</span>
          <input
            type="checkbox"
            checked={autoAdjust}
            onChange={(e) => setAutoAdjust(e.target.checked)}
            className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Giá trung bình', value: '1,900,000 ₫', change: '+8%', icon: Activity },
          { label: 'Doanh thu dự kiến', value: '95.2B ₫', change: '+12%', icon: TrendingUp },
          { label: 'Tỷ lệ lấp đầy', value: '66%', change: '+5%', icon: Activity }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-3">
              <metric.icon className="w-8 h-8 text-primary" />
              <span className="text-green-600 text-sm font-semibold">{metric.change}</span>
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Pricing Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Giá theo thời gian thực</h3>
        <div className="space-y-4">
          {priceData.map((data, index) => (
            <motion.div
              key={data.route}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{data.route}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDemandColor(data.demandLevel)}`}>
                      {data.demandLevel === 'high' && 'Nhu cầu cao'}
                      {data.demandLevel === 'medium' && 'Nhu cầu trung bình'}
                      {data.demandLevel === 'low' && 'Nhu cầu thấp'}
                    </span>
                    <span className="text-sm text-slate-500">•</span>
                    <span className="text-sm text-slate-500">Lấp đầy {data.occupancyRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {data.priceChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : data.priceChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : null}
                    <span className={`text-sm font-semibold ${
                      data.priceChange > 0 ? 'text-green-600' : data.priceChange < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {data.priceChange > 0 ? '+' : ''}{data.priceChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giá cơ bản</p>
                  <p className="font-semibold">{data.basePrice.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giá hiện tại</p>
                  <p className="font-semibold text-primary">{data.currentPrice.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giá đề xuất</p>
                  <p className="font-semibold">{data.recommendedPrice.toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
