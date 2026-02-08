"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Calendar,
  DollarSign,
  Save,
  AlertCircle,
} from "lucide-react";

export function BulkUpdate() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [updateType, setUpdateType] = useState<"price" | "availability">(
    "price",
  );
  const [priceChange, setPriceChange] = useState({
    type: "percentage",
    value: 0,
  });
  const [availabilityChange, setAvailabilityChange] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const roomTypes = [
    "Deluxe Room",
    "Suite Room",
    "Family Room",
    "Presidential Suite",
  ];

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  };

  const handleBulkUpdate = () => {
    if (!startDate || !endDate || selectedRooms.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    alert(
      `Cập nhật ${selectedRooms.length} loại phòng từ ${startDate} đến ${endDate}`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Cập nhật Hàng loạt
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Cập nhật giá và khả dụng hàng loạt cho nhiều ngày
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Update Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Loại cập nhật
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUpdateType("price")}
                className={`p-4 rounded-xl border transition-colors ${
                  updateType === "price"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Cập nhật Giá</p>
              </button>
              <button
                onClick={() => setUpdateType("availability")}
                className={`p-4 rounded-xl border transition-colors ${
                  updateType === "availability"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Cập nhật Khả dụng</p>
              </button>
            </div>
          </div>

          {/* Price Change */}
          {updateType === "price" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium">Thay đổi giá</label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={priceChange.type}
                  onChange={(e) =>
                    setPriceChange((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
                <input
                  type="number"
                  value={priceChange.value}
                  onChange={(e) =>
                    setPriceChange((prev) => ({
                      ...prev,
                      value: parseFloat(e.target.value),
                    }))
                  }
                  placeholder={
                    priceChange.type === "percentage" ? "VD: 10" : "VD: 100000"
                  }
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn loại phòng
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roomTypes.map((room) => (
                <button
                  key={room}
                  onClick={() => toggleRoom(room)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selectedRooms.includes(room)
                      ? "bg-primary/10 border-primary"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p className="font-medium">{room}</p>
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Đã chọn: {selectedRooms.length} loại phòng
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleBulkUpdate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Save className="w-5 h-5" />
            Áp dụng Cập nhật
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Lưu ý quan trọng
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Thay đổi sẽ áp dụng cho tất cả các ngày trong khoảng thời gian đã
              chọn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
