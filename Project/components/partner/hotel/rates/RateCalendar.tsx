"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";

interface DayRate {
  date: string;
  price: number;
  available: boolean;
}

export function RateCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState("deluxe");

  const roomTypes = [
    { id: "deluxe", name: "Deluxe Room", basePrice: 2000000 },
    { id: "suite", name: "Suite Room", basePrice: 3500000 },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (DayRate | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    const selectedRoomType = roomTypes.find((rt) => rt.id === selectedRoom);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // Weekend prices are 20% higher
      const isWeekend =
        new Date(year, month, day).getDay() === 0 ||
        new Date(year, month, day).getDay() === 6;
      const multiplier = isWeekend ? 1.2 : 1;
      days.push({
        date: dateStr,
        price: (selectedRoomType?.basePrice || 2000000) * multiplier,
        available: Math.random() > 0.2, // 80% availability
      });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Lịch Giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý giá phòng theo ngày
        </p>
      </div>

      {/* Room Type Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <label className="block text-sm font-medium mb-3">
          Chọn loại phòng
        </label>
        <div className="flex gap-3">
          {roomTypes.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                selectedRoom === room.id
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold capitalize">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm text-slate-500 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              {day ? (
                <div
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all hover:shadow-lg ${
                    day.available
                      ? "border-slate-200 dark:border-slate-700 hover:border-primary"
                      : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {new Date(day.date).getDate()}
                  </div>
                  <div
                    className={`text-xs font-bold ${day.available ? "text-primary" : "text-red-600"}`}
                  >
                    {day.price.toLocaleString("vi-VN")}
                  </div>
                  {!day.available && (
                    <div className="text-xs text-red-600 mt-1">Hết phòng</div>
                  )}
                </div>
              ) : (
                <div className="p-3" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary" />
            <span className="text-sm">Còn phòng</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-50 dark:bg-red-900/20 border border-red-200" />
            <span className="text-sm">Hết phòng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
