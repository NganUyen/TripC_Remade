"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookingSummary } from "@/components/checkout/BookingSummary";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseClient } from "@/lib/supabase";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = useSupabaseClient();

    const bookingId = searchParams.get('bookingId');

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<any>(null);
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Booking
                console.log("Fetching booking with ID:", bookingId);
                const { data: bookingData, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', bookingId)
                    .single();

                if (error) {
                    console.error("Supabase booking fetch error:", error);
                    toast.error("Không tìm thấy đơn hàng: " + error.message);
                    return;
                }

                if (!bookingData) {
                    console.warn("No booking data returned for ID:", bookingId);
                    toast.error("Không tìm thấy đơn hàng");
                    return;
                }

                console.log("Booking data fetched successfully:", bookingData);

                // Check expiry if needed (for transport held bookings)
                if (bookingData.status === 'held' && new Date(bookingData.expires_at) < new Date()) {
                    toast.error("Đơn hàng đã hết thời gian giữ chỗ.");
                    router.push('/');
                    return;
                }

                setBooking(bookingData);

                // 2. Fetch Details based on type
                if (bookingData.category === 'transport') {
                    if (bookingData.metadata?.routeId) {
                        const { data: routeData, error: routeError } = await supabase
                            .from('transport_routes')
                            .select(`*, transport_providers (name, logo_url)`)
                            .eq('id', bookingData.metadata.routeId)
                            .single();

                        if (!routeError) setDetails(routeData);
                    }
                } else if (bookingData.category === 'wellness') {
                    if (bookingData.metadata?.experience_id) {
                        const { data: wellData, error: wellError } = await supabase
                            .from('wellness')
                            .select('*')
                            .eq('id', bookingData.metadata.experience_id)
                            .single();

                        if (!wellError) setDetails(wellData);
                    }
                } else if (bookingData.category === 'activity') {
                    if (bookingData.metadata?.activity_id) {
                        const { data: actData, error: actError } = await supabase
                            .from('activities')
                            .select('*')
                            .eq('id', bookingData.metadata.activity_id)
                            .single();

                        if (!actError) setDetails(actData);
                    }
                } else if (bookingData.category === 'flight') {
                    // For flights, details are in metadata since it's a mock provider flow
                    setDetails(bookingData.metadata?.trip || {});
                }

            } catch (error) {
                console.error(error);
                toast.error("Lỗi tải thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, supabase, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark gap-4">
                <h2 className="text-xl font-bold">Booking not found</h2>
                <Link href="/" className="text-primary hover:underline">Back to Home</Link>
            </div>
        );
    }

    // Adapt logic for passing to components
    // CheckoutBookingSummary expects: type, details, booking
    // PaymentSection expects: bookingId, amount

    return (
        <div className="min-h-screen p-6 md:p-12 bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-2xl font-bold">Checkout</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground opacity-50">
                            <span className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">1</span>
                            Selection
                        </div>
                        <div className="w-8 h-px bg-border-subtle"></div>
                        <div className="flex items-center gap-2 text-sm font-bold text-primary">
                            <span className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                            Payment
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-16">
                    {/* Left: Payment Methods */}
                    <PaymentSection
                        bookingId={booking.id}
                        amount={booking.total_amount}
                    />

                    {/* Right: Summary */}
                    <BookingSummary
                        type={booking.category as any}
                        details={details}
                        booking={booking}
                    />
                </div>
            </div>
        </div>
    );
}
