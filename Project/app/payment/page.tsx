"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PaymentSection } from "@/components/payment/PaymentSection";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { useSupabaseClient } from "@/lib/supabase";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from "@/lib/utils/currency";

import { PaymentSkeleton } from "@/components/payment/PaymentSkeleton";

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = useSupabaseClient();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { isLoaded } = useSession();

    useEffect(() => {
        if (!isLoaded) return; // Wait for auth to initialize

        const fetchBooking = async () => {
            if (!bookingId) {
                toast.error("Thiếu mã đơn hàng!");
                router.push('/');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/bookings/${bookingId}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Booking not found");
                    if (res.status === 403) throw new Error("Unauthorized");
                    throw new Error("Failed to fetch booking");
                }
                const data = await res.json();
                setBooking(data);
            } catch (error) {
                console.error(error);
                toast.error("Không tìm thấy đơn hàng hoặc đã hết hạn");
                router.push('/my-bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, router, isLoaded]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
                <PaymentSkeleton />
            </main>
        );
    }

    if (!booking) return null;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/my-bookings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold text-sm">Quay lại Đặt chỗ của tôi</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <PaymentSection
                        bookingId={booking.id}
                        amount={booking.total_amount}
                        category={booking.category}
                        currency={booking.currency || 'USD'}
                        title={booking.title}
                        description={booking.description}
                        bookingCode={booking.booking_code || booking.id.slice(0, 8).toUpperCase()}
                        guestName={`${booking.guest_details?.lastName || ''} ${booking.guest_details?.firstName || ''}`.trim()}
                    />
                </div>
            </div>
        </main>
    );
}
