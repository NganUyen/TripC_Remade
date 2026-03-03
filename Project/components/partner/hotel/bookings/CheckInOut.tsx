"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, Search, Clock, Check, X } from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: "pending" | "checked-in" | "checked-out";
}

export function CheckInOut({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        const res = await fetch(
          `/api/partner/hotel/bookings?hotel_id=${hotelId}&status=confirmed,checked_in`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBookings(
              (data.data || []).map((b: any) => ({
                id: b.id,
                guestName: b.guest_name ?? b.profiles?.full_name ?? "Khách",
                roomNumber: b.room_number ?? b.hotel_rooms?.name ?? "-",
                checkInDate: b.check_in_date ?? b.check_in ?? "",
                checkOutDate: b.check_out_date ?? b.check_out ?? "",
                status:
                  b.status === "checked_in"
                    ? "checked-in"
                    : b.status === "checked_out"
                      ? "checked-out"
                      : "pending",
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

  const updateBookingStatus = async (id: string, status: string) => {
    // Optimistic
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: status === "checked_in" ? "checked-in" : "checked-out",
            }
          : b,
      ),
    );
    try {
      const token = await getToken();
      await fetch(`/api/partner/hotel/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckIn = (id: string) => updateBookingStatus(id, "checked_in");
  const handleCheckOut = (id: string) => updateBookingStatus(id, "checked_out");

  const filteredBookings = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNumber.includes(searchTerm),
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Check-in/Check-out
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý check-in và check-out nhanh
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên khách hoặc số phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {booking.guestName}
                </h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>Phòng: {booking.roomNumber}</p>
                  <p>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Check-in:{" "}
                    {new Date(booking.checkInDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p>
                    Check-out:{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {booking.status === "pending" && (
                  <button
                    onClick={() => handleCheckIn(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Check-in
                  </button>
                )}
                {booking.status === "checked-in" && (
                  <button
                    onClick={() => handleCheckOut(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4" />
                    Check-out
                  </button>
                )}
                {booking.status === "checked-out" && (
                  <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    Đã trả phòng
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
