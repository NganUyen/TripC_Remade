'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save } from 'lucide-react';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailBookings: true,
    emailReviews: true,
    emailPayments: true,
    smsBookings: false,
    smsReviews: false,
    pushBookings: true,
    pushReviews: true,
    pushPayments: true
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Thông báo
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Cài đặt thông báo và nhắc nhở
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo Email</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt phòng mới</span>
                <input
                  type="checkbox"
                  checked={settings.emailBookings}
                  onChange={() => toggleSetting('emailBookings')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đánh giá mới</span>
                <input
                  type="checkbox"
                  checked={settings.emailReviews}
                  onChange={() => toggleSetting('emailReviews')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Thanh toán</span>
                <input
                  type="checkbox"
                  checked={settings.emailPayments}
                  onChange={() => toggleSetting('emailPayments')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo SMS</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt phòng mới</span>
                <input
                  type="checkbox"
                  checked={settings.smsBookings}
                  onChange={() => toggleSetting('smsBookings')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đánh giá mới</span>
                <input
                  type="checkbox"
                  checked={settings.smsReviews}
                  onChange={() => toggleSetting('smsReviews')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo Push</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt phòng mới</span>
                <input
                  type="checkbox"
                  checked={settings.pushBookings}
                  onChange={() => toggleSetting('pushBookings')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đánh giá mới</span>
                <input
                  type="checkbox"
                  checked={settings.pushReviews}
                  onChange={() => toggleSetting('pushReviews')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Thanh toán</span>
                <input
                  type="checkbox"
                  checked={settings.pushPayments}
                  onChange={() => toggleSetting('pushPayments')}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
            <Save className="w-5 h-5" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
