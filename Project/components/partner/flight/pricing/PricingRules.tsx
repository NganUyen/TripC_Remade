'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface PricingRule {
  id: string;
  name: string;
  route: string;
  basePrice: number;
  class: 'economy' | 'business' | 'first';
  weekendMultiplier: number;
  holidayMultiplier: number;
  advanceBookingDiscount: number;
}

export default function PricingRules() {
  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'HAN-SGN Economy Standard',
      route: 'HAN - SGN',
      basePrice: 2000000,
      class: 'economy',
      weekendMultiplier: 1.2,
      holidayMultiplier: 1.5,
      advanceBookingDiscount: 15
    },
    {
      id: '2',
      name: 'HAN-SGN Business Premium',
      route: 'HAN - SGN',
      basePrice: 5000000,
      class: 'business',
      weekendMultiplier: 1.15,
      holidayMultiplier: 1.3,
      advanceBookingDiscount: 10
    }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quy tắc Giá
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý quy tắc định giá vé máy bay
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm quy tắc
        </button>
      </div>

      {/* Pricing Rules List */}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{rule.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{rule.route}</p>
              </div>
              <div className="flex items-center gap-2">
                {editingId === rule.id ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(rule.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Giá cơ bản</p>
                <p className="text-xl font-bold text-primary">{rule.basePrice.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hạng vé</p>
                <p className="text-lg font-semibold capitalize">
                  {rule.class === 'economy' && 'Phổ thông'}
                  {rule.class === 'business' && 'Thương gia'}
                  {rule.class === 'first' && 'Hạng nhất'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cuối tuần</p>
                <p className="text-lg font-semibold">x{rule.weekendMultiplier}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ngày lễ</p>
                <p className="text-lg font-semibold">x{rule.holidayMultiplier}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
