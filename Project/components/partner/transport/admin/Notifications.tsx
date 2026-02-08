"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Trash2,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_link?: string;
  provider_id: string;
}

export function Notifications() {
  const supabase = useSupabaseClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get all user's providers
      const { data: providers } = await supabase
        .from("transport_providers")
        .select("id")
        .eq("owner_id", user.id);

      if (!providers || providers.length === 0) {
        setLoading(false);
        return;
      }

      const providerIds = providers.map((p) => p.id);

      const { data: notifs } = await supabase
        .from("transport_notifications")
        .select("*")
        .in("provider_id", providerIds)
        .order("created_at", { ascending: false });

      if (notifs) {
        setNotifications(notifs as unknown as Notification[]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transport_notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: providers } = await supabase
        .from("transport_providers")
        .select("id")
        .eq("owner_id", user.id);

      if (!providers || providers.length === 0) return;
      const providerIds = providers.map((p) => p.id);

      const { error } = await supabase
        .from("transport_notifications")
        .update({ is_read: true })
        .in("provider_id", providerIds)
        .eq("is_read", false);

      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transport_notifications")
        .delete()
        .eq("id", id);

      if (!error) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeConfig = (type: Notification["type"]) => {
    const configs = {
      info: {
        icon: Info,
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600",
        border: "border-blue-100 dark:border-blue-500/20",
        accent: "bg-blue-600",
      },
      success: {
        icon: CheckCircle,
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600",
        border: "border-emerald-100 dark:border-emerald-500/20",
        accent: "bg-emerald-600",
      },
      warning: {
        icon: AlertCircle,
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-100 dark:border-amber-500/20",
        accent: "bg-amber-600",
      },
      error: {
        icon: X,
        bg: "bg-rose-50 dark:bg-rose-500/10",
        text: "text-rose-600",
        border: "border-rose-100 dark:border-rose-500/20",
        accent: "bg-rose-600",
      },
    };
    return configs[type] || configs.info;
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.is_read);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl relative">
            <Bell className="w-8 h-8 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Thông báo
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo mới chưa xem`
                : "Bạn đã xem hết tất cả thông báo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="group flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 rounded-2xl hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Đánh dấu tất cả
          </button>
          <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary group transition-all shadow-sm">
            <Settings className="w-6 h-6 text-slate-500 group-hover:text-primary group-hover:rotate-45 transition-all" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[1.25rem] w-fit border border-slate-200 dark:border-slate-700/50">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              filter === f
                ? "bg-white dark:bg-slate-700 text-primary shadow-md scale-[1.02]"
                : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            {f === "all" ? "Tất cả" : `Chưa xem (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => {
            const config = getTypeConfig(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 border ${notification.is_read ? "border-slate-100 dark:border-slate-800 opacity-75" : "border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none"} transition-all hover:scale-[1.01] relative overflow-hidden group`}
              >
                {!notification.is_read && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accent}`}
                  />
                )}
                <div className="flex items-center gap-6">
                  <div
                    className={`w-14 h-14 ${config.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <config.icon className={`w-7 h-7 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`text-lg font-black tracking-tight ${notification.is_read ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl transition-all"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                          Mới
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Hộp thư trống
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              {filter === "unread"
                ? "Tuyệt vời! Bạn đã xử lý hết các thông báo quan trọng."
                : "Bạn chưa có thông báo nào trong danh sách này."}
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Tùy chỉnh thông báo
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: "Đặt chỗ mới",
                description: "Thông báo tức thì khi có đơn đặt chỗ mới",
                enabled: true,
              },
              {
                label: "Giao dịch",
                description: "Báo cáo doanh thu và trạng thái thanh toán",
                enabled: true,
              },
              {
                label: "Phản hồi",
                description: "Cập nhật đánh giá và bình luận mới",
                enabled: true,
              },
              {
                label: "Hệ thống",
                description: "Thông báo bảo trì và cập nhật tính năng",
                enabled: false,
              },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group/setting"
              >
                <div>
                  <p className="font-black text-slate-900 dark:text-white group-hover/setting:text-primary transition-colors">
                    {setting.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {setting.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={setting.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
