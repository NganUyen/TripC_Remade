"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import MembershipCard from "@/components/bookings/MembershipCard";
import WelcomeHeader from "@/components/bookings/WelcomeHeader";
import { Footer } from "@/components/Footer";
import BookingTabs from "@/components/bookings/BookingTabs";
import InspirationCard from "@/components/bookings/InspirationCard";
import QuickAccessLinks from "@/components/bookings/QuickAccessLinks";
import { Ticket, CheckCircle2, Clock, XCircle } from "lucide-react";
import UpcomingBookingCard from "@/components/bookings/cards/UpcomingBookingCard";
import PendingBookingCard from "@/components/bookings/cards/PendingBookingCard";
import CancelledBookingCard from "@/components/bookings/cards/CancelledBookingCard";
import TransportBookingCard from "@/components/bookings/cards/TransportBookingCard";
import ShopBookingCard from "@/components/bookings/cards/ShopBookingCard";
import EntertainmentBookingCard from "@/components/bookings/cards/EntertainmentBookingCard";
import { BookingListSkeleton } from "@/components/bookings/BookingListSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filtering State
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>(
    searchParams.get("tab") || "booked",
  ); // 'booked' | 'awaiting' | 'cancelled'

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["booked", "awaiting", "cancelled"].includes(tab)) {
      setActiveStatus(tab);
    }
  }, [searchParams]);

  // Ref to prevent double-processing (MoMo, PayPal, Success Toast)
  const processedRef = useRef<boolean>(false);

  // Handle Return Params (MoMo & PayPal & Success)
  useEffect(() => {
    // 1. Handle MoMo
    const momoOrderId = searchParams.get("orderId");
    const momoResultCode = searchParams.get("resultCode");

    if (momoOrderId && momoResultCode !== null) {
      if (processedRef.current) return;
      processedRef.current = true;
      setIsSyncing(true);

      const verifyMomo = async () => {
        try {
          const res = await fetch("/api/payments/momo/verify-redirect", {
            method: "POST",
            body: JSON.stringify({
              orderId: momoOrderId,
              resultCode: momoResultCode,
              message: searchParams.get("message"),
              signature: searchParams.get("signature"),
            }),
          });
          const data = await res.json();
          if (data.ok && data.status === "success") {
            window.location.href = "/my-bookings?tab=booked&success=true";
          } else {
            toast.error("Thanh toán thất bại");
            setTimeout(
              () => (window.location.href = "/my-bookings?tab=cancelled"),
              2000,
            );
          }
        } catch (error) {
          toast.error("Lỗi xác minh thanh toán");
          setIsSyncing(false);
          setTimeout(
            () => (window.location.href = "/my-bookings?tab=cancelled"),
            2000,
          );
        }
      };
      verifyMomo();
      return;
    }

    // 2. Handle PayPal
    const paypalToken = searchParams.get("token");
    const paypalPayerId = searchParams.get("PayerID");

    if (paypalToken && paypalPayerId) {
      if (processedRef.current) return;
      processedRef.current = true;
      setIsSyncing(true);

      const syncPayPal = async () => {
        try {
          const res = await fetch("/api/payments/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "paypal",
              token: paypalToken,
              payerId: paypalPayerId,
            }),
          });
          const data = await res.json();
          if (data.ok) {
            window.location.href = "/my-bookings?tab=booked&success=true";
          } else {
            toast.error("Lỗi xác minh PayPal");
            setIsSyncing(false);
            setTimeout(
              () => (window.location.href = "/my-bookings?tab=cancelled"),
              2000,
            );
          }
        } catch (err) {
          toast.error("Lỗi kết nối");
          setIsSyncing(false);
          setTimeout(
            () => (window.location.href = "/my-bookings?tab=cancelled"),
            2000,
          );
        }
      };
      syncPayPal();
      return;
    }

    // 3. Handle Regular Success
    if (searchParams.get("success") === "true" && !processedRef.current) {
      processedRef.current = true;
      toast.success("Thanh toán thành công!", {
        description: "Đặt chỗ của bạn đã được xác nhận.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchBookings() {
      if (isSyncing) return;
      setIsLoading(true);
      try {
        const bId = searchParams.get("bookingId");
        const url = bId
          ? `/api/bookings/user?bookingId=${bId}`
          : "/api/bookings/user";

        const res = await fetch(url);
        if (res.status === 401) {
          setBookings([]);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        // Silent error
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, [isSyncing, searchParams]);

  // --- FILTERING LOGIC ---
  const getStatusGroup = (status: string, paymentStatus: string) => {
    const s = status?.toLowerCase();
    const p = paymentStatus?.toLowerCase();

    if (["cancelled", "expired", "failed"].includes(s)) return "cancelled";
    if (["confirmed", "paid", "ticketed", "completed", "success"].includes(s))
      return "booked";
    // Fallback logic mostly for 'pending' or 'held'
    if (p === "paid" || p === "success") return "booked";

    return "awaiting"; // Default for pending/held/unpaid
  };

  const filteredBookings = bookings.filter((booking) => {
    // 1. Filter by Category
    if (activeCategory !== "all") {
      // Handle 'other' if needed, or strict match
      if (booking.category !== activeCategory) return false;
    }

    // 2. Filter by Status
    const group = getStatusGroup(booking.status, booking.payment_status);
    return group === activeStatus;
  });

  const renderBookingCard = (booking: any) => {
    const group = getStatusGroup(booking.status, booking.payment_status);

    if (group === "awaiting") {
      return <PendingBookingCard key={booking.id} booking={booking} />;
    }
    if (group === "cancelled") {
      return <CancelledBookingCard key={booking.id} booking={booking} />;
    }

    // Specific cards for confirmed/booked items
    if (booking.category === "transport") {
      return <TransportBookingCard key={booking.id} booking={booking} />;
    }
    if (booking.category === "shop") {
      return <ShopBookingCard key={booking.id} booking={booking} />;
    }
    if (booking.category === "entertainment") {
      return <EntertainmentBookingCard key={booking.id} booking={booking} />;
    }

    return <UpcomingBookingCard key={booking.id} booking={booking} />;
  };

  const statusTabs = [
    { id: "booked", label: "Đã đặt", icon: CheckCircle2 },
    { id: "awaiting", label: "Chờ thanh toán", icon: Clock },
    { id: "cancelled", label: "Đã hủy", icon: XCircle },
  ];

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-12 bg-[#fcfaf8] dark:bg-[#0a0a0a] min-h-screen transition-colors duration-500"
      >
        <div className="grid grid-cols-12 w-full mb-12 gap-8">
          <MembershipCard />
          <WelcomeHeader />
        </div>

        <section className="mb-16">
          {/* CATEGORY TABS */}
          <BookingTabs
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
          />

          {/* STATUS FILTER TABS */}
          <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-white/10 pb-1 overflow-x-auto">
            {statusTabs.map((tab) => {
              const isActive = activeStatus === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatus(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-bold relative transition-colors whitespace-nowrap",
                    isActive
                      ? "text-[#FF5E1F]"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeStatusLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5E1F]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* LIST */}
          {isLoading || isSyncing ? (
            <BookingListSkeleton />
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm"
            >
              <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Ticket className="size-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                Không có đặt chỗ nào
              </h3>
              <p className="text-slate-500 text-sm">
                Không tìm thấy vé nào trong mục{" "}
                <span className="font-bold">
                  {activeStatus === "booked"
                    ? "Đã đặt"
                    : activeStatus === "awaiting"
                      ? "Chờ thanh toán"
                      : "Đã hủy"}
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderBookingCard(booking)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <div className="grid grid-cols-12 w-full pb-16 border-t border-slate-100 dark:border-white/5 pt-16 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <InspirationCard />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <QuickAccessLinks />
          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}
