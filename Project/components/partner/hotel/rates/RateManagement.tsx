"use client";

import React, { useState } from "react";
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

export function RateManagement() {
  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: "1",
      roomType: "Deluxe Room",
      basePrice: 1500000,
      weekendMultiplier: 1.3,
      holidayMultiplier: 1.5,
      minStay: 1,
      maxDiscount: 20,
    },
    {
      id: "2",
      roomType: "Suite Room",
      basePrice: 2500000,
      weekendMultiplier: 1.4,
      holidayMultiplier: 1.6,
      minStay: 1,
      maxDiscount: 15,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingRule>>({});

  const handleEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setEditForm(rule);
  };

  const handleSave = () => {
    if (editingId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingId ? ({ ...r, ...editForm } as PricingRule) : r,
        ),
      );
      setEditingId(null);
      setEditForm({});
    }
  };

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
