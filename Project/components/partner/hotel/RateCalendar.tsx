/**
 * Rate Calendar Component
 * Manage room rates across dates
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";

interface Rate {
  id: string;
  date: string;
  price_cents: number;
  available_rooms: number;
  min_nights?: number;
  cancellation_policy: string;
  refundable: boolean;
  breakfast_included: boolean;
}

interface RateCalendarProps {
  partnerId: string;
  roomId: string;
  roomTitle: string;
}

export function RateCalendar({
  partnerId,
  roomId,
  roomTitle,
}: RateCalendarProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    price_cents: 0,
    available_rooms: 0,
    min_nights: 1,
    cancellation_policy: "moderate",
    refundable: true,
    breakfast_included: false,
  });

  useEffect(() => {
    fetchRates();
  }, [currentMonth, roomId]);

  async function fetchRates() {
    try {
      setLoading(true);
      const startDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      )
        .toISOString()
        .split("T")[0];
      const endDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      )
        .toISOString()
        .split("T")[0];

      const url = new URL("/api/partner/hotel/rates", window.location.origin);
      url.searchParams.set("room_id", roomId);
      url.searchParams.set("start_date", startDate);
      url.searchParams.set("end_date", endDate);

      const response = await fetch(url, {
        headers: {
          "x-partner-id": partnerId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rates");
      }

      const result = await response.json();
      if (result.success) {
        setRates(result.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveRate(date: string) {
    try {
      const response = await fetch("/api/partner/hotel/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-partner-id": partnerId,
        },
        body: JSON.stringify({
          room_id: roomId,
          date,
          ...editForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save rate");
      }

      const result = await response.json();
      if (result.success) {
        setEditingDate(null);
        fetchRates();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function bulkUpdate() {
    const confirmed = confirm(
      "Update rates for the entire month with current form values?",
    );
    if (!confirmed) return;

    try {
      const startDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      )
        .toISOString()
        .split("T")[0];
      const endDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      )
        .toISOString()
        .split("T")[0];

      const response = await fetch("/api/partner/hotel/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-partner-id": partnerId,
        },
        body: JSON.stringify({
          room_id: roomId,
          start_date: startDate,
          end_date: endDate,
          ...editForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk update rates");
      }

      const result = await response.json();
      if (result.success) {
        alert(`Successfully updated ${result.data.length} rates`);
        fetchRates();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getRateForDate = (date: Date | null) => {
    if (!date) return null;
    const dateStr = date.toISOString().split("T")[0];
    return rates.find((r) => r.date === dateStr);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rate Calendar
          </h2>
          <p className="text-slate-500 dark:text-slate-400">{roomTitle}</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                ),
              )
            }
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {monthName}
          </span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                ),
              )
            }
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Edit Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Quick Rate Update
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              value={editForm.price_cents / 100}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  price_cents: parseFloat(e.target.value) * 100,
                })
              }
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Available
            </label>
            <input
              type="number"
              value={editForm.available_rooms}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  available_rooms: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Min Nights
            </label>
            <input
              type="number"
              value={editForm.min_nights}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  min_nights: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Policy
            </label>
            <select
              value={editForm.cancellation_policy}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  cancellation_policy: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="flexible">Flexible</option>
              <option value="moderate">Moderate</option>
              <option value="strict">Strict</option>
              <option value="non_refundable">Non-refundable</option>
            </select>
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.breakfast_included}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    breakfast_included: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Breakfast
              </span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={bulkUpdate}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Apply to Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const dateStr = day.toISOString().split("T")[0];
              const rate = getRateForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date();

              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => {
                    if (rate) {
                      setEditForm({
                        price_cents: rate.price_cents,
                        available_rooms: rate.available_rooms,
                        min_nights: rate.min_nights || 1,
                        cancellation_policy: rate.cancellation_policy,
                        refundable: rate.refundable,
                        breakfast_included: rate.breakfast_included,
                      });
                    }
                    setEditingDate(dateStr);
                  }}
                  className={`aspect-square p-2 rounded-lg cursor-pointer transition-all ${
                    isToday ? "ring-2 ring-primary" : ""
                  } ${
                    rate
                      ? "bg-primary/10 hover:bg-primary/20"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  } ${isPast ? "opacity-50" : ""}`}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      {day.getDate()}
                    </div>
                    {rate ? (
                      <>
                        <div className="text-xs font-bold text-primary">
                          {formatCurrency(rate.price_cents)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {rate.available_rooms} left
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400">No rate</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal (Simple Version) */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Edit Rate for {editingDate}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={editForm.price_cents / 100}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price_cents: parseFloat(e.target.value) * 100,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Available Rooms
                </label>
                <input
                  type="number"
                  value={editForm.available_rooms}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      available_rooms: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => saveRate(editingDate)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingDate(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
