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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!booking) return null;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <CheckoutSteps currentStep="payment" />
                <div className="mb-8">
                    <Link href="/my-bookings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Quay lại Đặt chỗ của tôi</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Booking Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm order-2 md:order-1">
                        <div className="aspect-video w-full relative rounded-2xl overflow-hidden mb-6 bg-slate-100">
                            {booking.image_url ? (
                                <Image
                                    src={booking.image_url}
                                    alt={booking.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    No Image
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{booking.title}</h2>
                        <p className="text-slate-500 mb-6">{booking.description}</p>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500">Mã đặt chỗ</span>
                                <span className="font-bold text-orange-500 font-mono">{booking.booking_code || booking.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500">Người đặt</span>
                                <span className="font-bold">{booking.guest_details?.lastName} {booking.guest_details?.firstName}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500">Tổng cộng</span>
                                <span className="font-black text-xl text-primary">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="order-1 md:order-2">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <PaymentSection
                                bookingId={booking.id}
                                amount={booking.total_amount}
                                category={booking.category}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
