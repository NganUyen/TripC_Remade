"use client";

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import MembershipCard from '@/components/bookings/MembershipCard'
import WelcomeHeader from '@/components/bookings/WelcomeHeader'
import { Footer } from '@/components/Footer';
import BookingTabs from '@/components/bookings/BookingTabs'
import InspirationCard from '@/components/bookings/InspirationCard'
import QuickAccessLinks from '@/components/bookings/QuickAccessLinks'
import { Loader2, Ticket } from 'lucide-react'
import UpcomingBookingCard from '@/components/bookings/cards/UpcomingBookingCard'
import PendingBookingCard from '@/components/bookings/cards/PendingBookingCard'
import CancelledBookingCard from '@/components/bookings/cards/CancelledBookingCard'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Ref to prevent double-processing (MoMo, PayPal, Success Toast)
  const processedRef = useRef<boolean>(false);

  // Handle Return Params (MoMo & PayPal & Success)
  useEffect(() => {
    // 1. Handle MoMo
    const momoOrderId = searchParams.get('orderId');
    const momoResultCode = searchParams.get('resultCode');
    const momoMessage = searchParams.get('message');
    const momoSignature = searchParams.get('signature');

    if (momoOrderId && momoResultCode !== null) {
      if (processedRef.current) return;
      processedRef.current = true;
      setIsSyncing(true); // BLOCK UI to prevent showing 'unpaid'

      const verifyMomo = async () => {
        try {
          const res = await fetch('/api/payments/momo/verify-redirect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: momoOrderId,
              resultCode: momoResultCode,
              message: momoMessage,
              signature: momoSignature,
            }),
          });

          const data = await res.json();

          if (data.ok && data.status === 'success') {
            window.location.href = '/my-bookings?success=true';
          } else if (data.status === 'failed') {
            toast.error("Thanh toán thất bại", {
              description: momoMessage || "Vui lòng thử lại."
            });
            setTimeout(() => window.location.href = '/my-bookings', 2000);
          }
        } catch (error) {
          console.error('[MOMO_REDIRECT_VERIFY_ERROR]', error);
          toast.error("Không thể xác minh thanh toán");
          setIsSyncing(false);
        }
      };

      verifyMomo();
      return;
    }

    // 2. Handle PayPal (Sync)
    const paypalToken = searchParams.get('token');
    const paypalPayerId = searchParams.get('PayerID');

    if (paypalToken && paypalPayerId) {
      if (processedRef.current) return;
      processedRef.current = true;
      setIsSyncing(true); // BLOCK UI

      const syncPayPal = async () => {
        try {
          toast.loading("Đang xác minh thanh toán PayPal...", { id: 'paypal-sync' });
          const res = await fetch('/api/payments/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'paypal',
              token: paypalToken,
              payerId: paypalPayerId
            })
          });

          const data = await res.json();

          if (data.ok) {
            toast.success("Thanh toán thành công!", { id: 'paypal-sync' });
            setTimeout(() => {
              window.location.href = '/my-bookings?success=true';
            }, 1000);
          } else {
            toast.error(`Lỗi xác minh: ${data.error}`, { id: 'paypal-sync' });
            setIsSyncing(false);
          }
        } catch (err) {
          console.error('PayPal sync failed', err);
          toast.error("Không thể kết nối máy chủ", { id: 'paypal-sync' });
          setIsSyncing(false);
        }
      };

      syncPayPal();
      return;
    }

    // 3. Handle Regular Success
    if (searchParams.get('success') === 'true') {
      if (!processedRef.current) {
        processedRef.current = true;
        toast.success("Thanh toán thành công!", {
          description: "Đặt chỗ của bạn đã được xác nhận."
        });
      }
    }

  }, [searchParams]);

  useEffect(() => {
    async function fetchBookings() {
      if (isSyncing) return; // Don't fetch while verifying

      setIsLoading(true);
      try {
        const res = await fetch('/api/bookings/user');
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error("Không thể tải danh sách đặt chỗ");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, [isSyncing]);

  const filteredBookings = bookings.filter((booking: any) => {
    if (activeTab === 'all') return true;
    return booking.booking_type === activeTab;
  });

  const renderBookingCard = (booking: any) => {
    if (booking.status === 'pending_payment' || booking.status === 'unpaid' || booking.payment_status === 'unpaid' || booking.status === 'held') {
      return <PendingBookingCard key={booking.id} booking={booking} />;
    }
    if (booking.status === 'cancelled') {
      return <CancelledBookingCard key={booking.id} booking={booking} />;
    }
    return <UpcomingBookingCard key={booking.id} booking={booking} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

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
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {isLoading || isSyncing ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                {isSyncing ? 'Đang xác minh thanh toán...' : 'Đang tải hành trình...'}
              </p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Ticket className="size-8 text-slate-300 dark:text-slate-700" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Sẵn sàng cho chuyến đi mới?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
                {activeTab === 'all'
                  ? 'Bạn chưa có đặt chỗ nào. Bắt đầu khám phá và lên kế hoạch cho hành trình tiếp theo ngay hôm nay!'
                  : `Không tìm thấy đặt chỗ nào trong mục ${activeTab}. Hãy thử kiểm tra các danh mục khác nhé.`}
              </p>
              <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                Khám phá ngay
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    variants={itemVariants}
                    layout
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
  )
}
