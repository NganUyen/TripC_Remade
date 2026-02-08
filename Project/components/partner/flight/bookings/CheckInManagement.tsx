"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Search, QrCode, Check, X } from "lucide-react";

interface CheckInItem {
  id: string;
  bookingRef: string;
  passengerName: string;
  flightNumber: string;
  seatNumber: string;
  checkedIn: boolean;
  boardingPass: boolean;
}

export default function CheckInManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([
    {
      id: "1",
      bookingRef: "ABC123",
      passengerName: "Nguyễn Văn A",
      flightNumber: "VN123",
      seatNumber: "12A",
      checkedIn: false,
      boardingPass: false,
    },
    {
      id: "2",
      bookingRef: "DEF456",
      passengerName: "Trần Thị B",
      flightNumber: "VN456",
      seatNumber: "15C",
      checkedIn: true,
      boardingPass: true,
    },
  ]);

  const handleCheckIn = (id: string) => {
    setCheckIns((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, checkedIn: true, boardingPass: true }
          : item,
      ),
    );
  };

  const filteredCheckIns = checkIns.filter(
    (item) =>
      item.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Quản lý Check-in
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Xử lý check-in và phát hành thẻ lên máy bay
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đặt chỗ, tên hành khách hoặc số hiệu chuyến bay..."
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Check-in List */}
      <div className="space-y-3">
        {filteredCheckIns.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.checkedIn
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  {item.checkedIn ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.passengerName}</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Mã đặt chỗ: {item.bookingRef}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chuyến bay
                  </p>
                  <p className="font-bold">{item.flightNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ghế
                  </p>
                  <p className="font-bold">{item.seatNumber}</p>
                </div>
                {!item.checkedIn ? (
                  <button
                    onClick={() => handleCheckIn(item.id)}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Check-in
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                      Đã check-in
                    </span>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
