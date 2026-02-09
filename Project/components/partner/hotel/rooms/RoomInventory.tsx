"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Calendar,
  Plus,
  Minus,
  AlertCircle,
  Check,
} from "lucide-react";

interface RoomInventory {
  id: string;
  roomType: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  blockedRooms: number;
}

export function RoomInventory() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [inventory, setInventory] = useState<RoomInventory[]>([
    {
      id: "1",
      roomType: "Deluxe Room",
      date: new Date().toISOString().split("T")[0],
      totalRooms: 20,
      availableRooms: 15,
      blockedRooms: 2,
    },
    {
      id: "2",
      roomType: "Suite Room",
      date: new Date().toISOString().split("T")[0],
      totalRooms: 10,
      availableRooms: 8,
      blockedRooms: 0,
    },
  ]);

  const updateAvailability = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newAvailable = Math.max(
            0,
            Math.min(
              item.totalRooms - item.blockedRooms,
              item.availableRooms + delta,
            ),
          );
          return { ...item, availableRooms: newAvailable };
        }
        return item;
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Tồn kho Phòng
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý số lượng phòng còn trống theo ngày
        </p>
      </div>

      {/* Date Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Chọn ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {inventory.map((item, index) => {
          const bookedRooms =
            item.totalRooms - item.availableRooms - item.blockedRooms;
          const occupancyRate = ((bookedRooms / item.totalRooms) * 100).toFixed(
            0,
          );

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {item.roomType}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Tỷ lệ lấp đầy:
                  </span>
                  <span className="font-bold text-primary">
                    {occupancyRate}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.totalRooms}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tổng số
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {item.availableRooms}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Còn trống
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {bookedRooms}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Đã đặt
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {item.blockedRooms}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Bị chặn
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cập nhật phòng còn trống:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateAvailability(item.id, -1)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">
                    {item.availableRooms}
                  </span>
                  <button
                    onClick={() => updateAvailability(item.id, 1)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alert */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Lưu ý quan trọng
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Cập nhật tồn kho thường xuyên để đảm bảo thông tin chính xác. Hệ
              thống sẽ tự động cập nhật khi có đặt phòng mới.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
