"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Edit, Save } from "lucide-react";

interface PricingRule {
  id: string;
  roomType: string;
  basePrice: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  minStay: number;
  maxDiscount: number;
}

export function RateManagement({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/partner/hotel/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.length > 0) {
            setHotelId(data.data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [partnerId]);

  useEffect(() => {
    if (!hotelId) return;
    (async () => {
      try {
        setLoading(true);
        const token = await getToken();
        // Fetch rooms and map each room as a "pricing rule"
        const res = await fetch(
          `/api/partner/hotel/rooms?hotel_id=${hotelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRules(
              (data.data || []).map((r: any) => ({
                id: r.id,
                roomType: r.name,
                basePrice: r.base_price_cents
                  ? r.base_price_cents / 100
                  : r.price_cents
                    ? r.price_cents / 100
                    : 0,
                weekendMultiplier: r.weekend_multiplier ?? 1.3,
                holidayMultiplier: r.holiday_multiplier ?? 1.5,
                minStay: r.min_nights ?? 1,
                maxDiscount: r.max_discount ?? 20,
              })),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [hotelId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingRule>>({});

  const handleEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setEditForm(rule);
  };

  const handleSave = async () => {
    if (!editingId) return;
    // Optimistic update
    setRules((prev) =>
      prev.map((r) =>
        r.id === editingId ? ({ ...r, ...editForm } as PricingRule) : r,
      ),
    );
    setEditingId(null);
    setEditForm({});
    try {
      const token = await getToken();
      await fetch(`/api/partner/hotel/rooms/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base_price_cents: editForm.basePrice
            ? editForm.basePrice * 100
            : undefined,
          weekend_multiplier: editForm.weekendMultiplier,
          holiday_multiplier: editForm.holidayMultiplier,
          min_nights: editForm.minStay,
          max_discount: editForm.maxDiscount,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Quản lý Giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý giá phòng và chính sách giá
        </p>
      </div>

      {/* Pricing Rules */}
      <div className="space-y-4">
        {rules.map((rule, index) => {
          const isEditing = editingId === rule.id;
          const displayRule = isEditing ? { ...rule, ...editForm } : rule;

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {displayRule.roomType}
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => handleEdit(rule)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Lưu
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Giá cơ bản (VNĐ/đêm)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.basePrice || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          basePrice: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      {displayRule.basePrice?.toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Hệ số cuối tuần
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.weekendMultiplier || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          weekendMultiplier: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ×{displayRule.weekendMultiplier}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Hệ số ngày lễ
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.holidayMultiplier || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          holidayMultiplier: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ×{displayRule.holidayMultiplier}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Chiến lược giá thông minh
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Hệ thống sẽ tự động điều chỉnh giá dựa trên nhu cầu và tỷ lệ lấp
              đầy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
