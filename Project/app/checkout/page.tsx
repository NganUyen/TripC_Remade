"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UnifiedCheckoutContainer } from "@/components/checkout/unified-checkout-container";
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

    // New Unified Checkout Flow
    return (
        <div className="min-h-screen p-6 md:p-12 bg-background-light dark:bg-background-dark">
            <UnifiedCheckoutContainer
                serviceType={booking.category as any}
                existingBooking={booking} // Pass the full booking object
                initialStep="payment"
            />
        </div>
    );
}
