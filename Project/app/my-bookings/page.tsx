"use client";

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import MembershipCard from '@/components/bookings/MembershipCard'
import WelcomeHeader from '@/components/bookings/WelcomeHeader'
import { Footer } from '@/components/Footer';
import BookingTabs from '@/components/bookings/BookingTabs'
import InspirationCard from '@/components/bookings/InspirationCard'
import QuickAccessLinks from '@/components/bookings/QuickAccessLinks'
import { Loader2 } from 'lucide-react'
import UpcomingBookingCard from '@/components/bookings/cards/UpcomingBookingCard'
import PendingBookingCard from '@/components/bookings/cards/PendingBookingCard'
import CancelledBookingCard from '@/components/bookings/cards/CancelledBookingCard'

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Thanh toán thành công!", {
        description: "Đặt chỗ của bạn đã được xác nhận."
      });
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchBookings() {
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
  }, []);

  const filteredBookings = bookings.filter((booking: any) => {
    if (activeTab === 'all') return ['confirmed', 'completed', 'held'].includes(booking.status);
    if (activeTab === 'pending') return booking.status === 'pending' || booking.status === 'held';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const renderBookingCard = (booking: any) => {
    if (activeTab === 'pending') {
      return <PendingBookingCard key={booking.id} booking={booking} />;
    }
    if (activeTab === 'cancelled') {
      return <CancelledBookingCard key={booking.id} booking={booking} />;
    }
    // Default / Upcoming
    return <UpcomingBookingCard key={booking.id} booking={booking} />;
  };

  return (
    <>
      <main className="w-full max-w-none px-6 lg:px-12 xl:px-16 py-10 bg-[#F9FAFB] dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
        <div className="asymmetric-grid w-full max-w-none mb-12 gap-y-8">
          <MembershipCard />
          <WelcomeHeader />
        </div>
        <section className="mb-12">
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Không có đặt chỗ nào</h3>
              <p className="text-muted text-sm max-w-xs">
                {activeTab === 'all'
                  ? 'Bạn chưa có chuyến đi nào được đặt.'
                  : activeTab === 'pending'
                    ? 'Không có đơn hàng nào đang chờ thanh toán.'
                    : 'Không có đặt chỗ nào bị hủy.'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${activeTab === 'pending' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
              {filteredBookings.map((booking) => renderBookingCard(booking))}
            </div>
          )}
        </section>
        <div className="asymmetric-grid w-full max-w-none pb-20">
          <div className="col-span-12 lg:col-span-8">
            <InspirationCard />
          </div>
          <QuickAccessLinks />
        </div>
      </main>
      <Footer />
    </>
  )
}
