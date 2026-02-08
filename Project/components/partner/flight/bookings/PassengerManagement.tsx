"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  flightNumber: string;
  seatNumber: string;
  bookingRef: string;
  date: string;
  status: "checked-in" | "booked" | "boarded";
}

export default function PassengerManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [passengers] = useState<Passenger[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      flightNumber: "VN123",
      seatNumber: "12A",
      bookingRef: "ABC123",
      date: "2026-02-08",
      status: "checked-in",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0907654321",
      flightNumber: "VN456",
      seatNumber: "15C",
      bookingRef: "DEF456",
      date: "2026-02-08",
      status: "booked",
    },
  ]);

  const filteredPassengers = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "booked":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "boarded":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Quản lý Hành khách
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Theo dõi và quản lý thông tin hành khách
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
            placeholder="Tìm theo tên, mã đặt chỗ hoặc số hiệu chuyến bay..."
            className="flex-1 bg-transparent outline-none"
          />
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Passenger List */}
      <div className="space-y-3">
        {filteredPassengers.map((passenger, index) => (
          <motion.div
            key={passenger.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{passenger.name}</h3>
                  <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {passenger.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {passenger.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(passenger.status)}`}
                >
                  {passenger.status === "checked-in" && "Đã check-in"}
                  {passenger.status === "booked" && "Đã đặt"}
                  {passenger.status === "boarded" && "Đã lên máy bay"}
                </span>
                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="text-slate-500">Chuyến bay:</span>{" "}
                    <span className="font-semibold">
                      {passenger.flightNumber}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Ghế:</span>{" "}
                    <span className="font-semibold">
                      {passenger.seatNumber}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Mã đặt chỗ:</span>{" "}
                    <span className="font-semibold">
                      {passenger.bookingRef}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
