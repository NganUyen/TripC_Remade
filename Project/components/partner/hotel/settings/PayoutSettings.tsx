"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save, Download } from "lucide-react";

export function PayoutSettings() {
  const [bankInfo, setBankInfo] = useState({
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "GRAND HOTEL",
    branch: "Chi nhánh TP.HCM",
  });

  const transactions = [
    { id: "1", date: "2025-02-01", amount: 50000000, status: "Đã thanh toán" },
    { id: "2", date: "2025-01-15", amount: 45000000, status: "Đã thanh toán" },
    { id: "3", date: "2025-01-01", amount: 38000000, status: "Đã thanh toán" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Thanh toán
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Cài đặt thông tin thanh toán và nhận tiền
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4">Thông tin ngân hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên ngân hàng
            </label>
            <input
              type="text"
              value={bankInfo.bankName}
              onChange={(e) =>
                setBankInfo((prev) => ({ ...prev, bankName: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Số tài khoản
            </label>
            <input
              type="text"
              value={bankInfo.accountNumber}
              onChange={(e) =>
                setBankInfo((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên tài khoản
            </label>
            <input
              type="text"
              value={bankInfo.accountName}
              onChange={(e) =>
                setBankInfo((prev) => ({
                  ...prev,
                  accountName: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Chi nhánh</label>
            <input
              type="text"
              value={bankInfo.branch}
              onChange={(e) =>
                setBankInfo((prev) => ({ ...prev, branch: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
          <Save className="w-5 h-5" />
          Lưu thay đổi
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4">Ngày</th>
                <th className="text-left py-3 px-4">Số tiền</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">{tx.date}</td>
                  <td className="py-3 px-4 font-semibold">
                    {tx.amount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
