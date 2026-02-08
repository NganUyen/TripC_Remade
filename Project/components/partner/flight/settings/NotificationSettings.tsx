"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Save } from "lucide-react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailBookings: true,
    emailCancellations: true,
    emailDelays: true,
    emailMaintenance: false,
    smsBookings: true,
    smsDelays: true,
    pushBookings: true,
    pushDelays: true,
    pushMaintenance: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Cài đặt Thông báo
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý thông báo và cảnh báo
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo Email</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt vé mới</span>
                <input
                  type="checkbox"
                  checked={settings.emailBookings}
                  onChange={() => toggleSetting("emailBookings")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Hủy chuyến bay</span>
                <input
                  type="checkbox"
                  checked={settings.emailCancellations}
                  onChange={() => toggleSetting("emailCancellations")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Trễ chuyến</span>
                <input
                  type="checkbox"
                  checked={settings.emailDelays}
                  onChange={() => toggleSetting("emailDelays")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Bảo trì máy bay</span>
                <input
                  type="checkbox"
                  checked={settings.emailMaintenance}
                  onChange={() => toggleSetting("emailMaintenance")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo SMS</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt vé mới</span>
                <input
                  type="checkbox"
                  checked={settings.smsBookings}
                  onChange={() => toggleSetting("smsBookings")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Trễ chuyến</span>
                <input
                  type="checkbox"
                  checked={settings.smsDelays}
                  onChange={() => toggleSetting("smsDelays")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông báo Push</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Đặt vé mới</span>
                <input
                  type="checkbox"
                  checked={settings.pushBookings}
                  onChange={() => toggleSetting("pushBookings")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Trễ chuyến</span>
                <input
                  type="checkbox"
                  checked={settings.pushDelays}
                  onChange={() => toggleSetting("pushDelays")}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>Bảo trì máy bay</span>
                <input
                  type="checkbox"
                  checked={settings.pushMaintenance}
                  onChange={() => toggleSetting("pushMaintenance")}
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
