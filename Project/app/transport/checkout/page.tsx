"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutHeader } from "@/components/transport/checkout/CheckoutHeader";
import { PassengerDetailsForm } from "@/components/transport/checkout/PassengerDetailsForm";
import { CheckoutBookingSummary } from "@/components/transport/checkout/CheckoutBookingSummary";
import { PaymentSection } from "@/components/transport/checkout/PaymentSection";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseClient } from "@/lib/supabase"; // Client side
import { useClerk, useUser } from "@clerk/nextjs";

export default function TransportCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const clerk = useClerk();
    const supabase = useSupabaseClient();

    // Params
    const routeId = searchParams.get('routeId');
    const resumeBookingId = searchParams.get('bookingId');
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers') || '1';

    // State
    const [route, setRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [booking, setBooking] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            setLoading(true);

            // CASE 1: RESUME BOOKING
            if (resumeBookingId) {
                const { data: bookingData, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', resumeBookingId)
                    .single();

                if (error || !bookingData) {
                    toast.error("Không tìm thấy đơn hàng hoặc đã hết hạn");
                    router.push('/transport');
                    return;
                }

                // Check expiry
                if (bookingData.status === 'held' && new Date(bookingData.expires_at) < new Date()) {
                    toast.error("Đơn hàng đã hết thời gian giữ chỗ. Vui lòng đặt lại.");
                    // Optional: auto-cancel logic here or just redirect
                    router.push('/transport');
                    return;
                }

                setBooking(bookingData);
                // Fetch associated route from metadata or separate table join if needed
                // Assuming metadata has routeId to refetch details
                if (bookingData.metadata?.routeId) {
                    await fetchRouteDetails(bookingData.metadata.routeId);
                }
                setStep('payment');
                setLoading(false);
                return;
            }

            // CASE 2: NEW BOOKING
            if (routeId) {
                await fetchRouteDetails(routeId);
                setLoading(false);
            }
        };

        init();
    }, [routeId, resumeBookingId, supabase, router]);

    // AUTO-RESUME: Check for pending booking data after sign-in
    useEffect(() => {
        if (user && route && !loading && !booking) {
            const pendingData = localStorage.getItem('pendingCheckoutData');
            if (pendingData) {
                try {
                    const formData = JSON.parse(pendingData);
                    // Clear it so we don't loop
                    localStorage.removeItem('pendingCheckoutData');

                    toast.success("Đang tiếp tục đặt vé...");
                    handleBookingCreation(formData);
                } catch (e) {
                    console.error("Failed to parse pending checkout data", e);
                    localStorage.removeItem('pendingCheckoutData');
                }
            }
        }
    }, [user, route, loading, booking]);

    const fetchRouteDetails = async (id: string) => {
        const { data, error } = await supabase
            .from('transport_routes')
            .select(`
                *,
                transport_providers (name, logo_url, rating)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            toast.error("Không tìm thấy thông tin chuyến đi");
        } else {
            setRoute(data);
        }
    };

    const handleBookingCreation = async (formData: any) => {
        if (!route) return;

        // AUTH CHECK: If guest, prompt sign-in
        if (!user) {
            // Save form data to persist across redirect
            localStorage.setItem('pendingCheckoutData', JSON.stringify(formData));

            const currentUrl = window.location.href;
            toast("Vui lòng đăng nhập để tiếp tục", {
                description: "Bạn cần có tài khoản để quản lý đơn hàng.",
                action: {
                    label: "Đăng nhập",
                    onClick: () => clerk.openSignIn({ forceRedirectUrl: currentUrl })
                }
            });
            clerk.openSignIn({ forceRedirectUrl: currentUrl }); // Open sign-in modal with redirect
            return;
        }

        setIsSubmitting(true);

        try {
            const rawAmount = route.price * parseInt(passengers);
            const totalAmount = rawAmount * 1.1; // +10% tax

            const res = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'transport',
                    title: route.transport_providers?.name || 'Transport Booking',
                    description: `${route.vehicle_type} • ${route.type}`,
                    imageUrl: route.images?.[0],
                    locationSummary: `${route.origin} -> ${route.destination}`,
                    startDate: route.departure_time,
                    endDate: route.arrival_time,
                    totalAmount: totalAmount,
                    guestDetails: {
                        ...formData,
                        passengersCount: parseInt(passengers)
                    },
                    metadata: {
                        routeId: route.id,
                        vehicleType: route.vehicle_type,
                        type: route.type
                    }
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Booking failed");
            }

            const newBooking = await res.json();
            setBooking(newBooking);

            // Save ID to local storage just in case of reload
            localStorage.setItem('pendingBookingId', newBooking.id);

            setStep('payment');
            toast.success("Đặt chỗ thành công!", {
                description: "Vui lòng hoàn tất thanh toán trong 8 phút."
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi đặt chỗ: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!route && !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark gap-4">
                <h2 className="text-xl font-bold">Trip not found</h2>
                <Link href="/transport" className="text-primary hover:underline">Back to Transport</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen items-center justify-center p-6 md:p-12 bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl w-full mx-auto space-y-8">
                <CheckoutHeader currentStep={step === 'payment' ? 2 : 1} />

                <div className="flex flex-col lg:flex-row items-stretch gap-16 min-h-[700px]">
                    {step === 'details' ? (
                        <PassengerDetailsForm onSubmit={handleBookingCreation} isSubmitting={isSubmitting} />
                    ) : (
                        <PaymentSection
                            bookingId={booking?.id}
                            amount={booking?.total_amount} // Use stored amount
                        />
                    )}

                    <CheckoutBookingSummary
                        route={route}
                        date={date || (booking ? new Date(booking.start_date).toISOString() : null)}
                        passengers={passengers}
                        expiresAt={booking?.expires_at}
                    />
                </div>

                <div className="flex justify-center gap-8 pt-4">
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Help Center</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
