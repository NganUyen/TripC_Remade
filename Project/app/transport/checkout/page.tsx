"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutHeader } from "@/components/transport/checkout/CheckoutHeader";
import { PassengerDetailsForm } from "@/components/transport/checkout/PassengerDetailsForm";
import { CheckoutBookingSummary } from "@/components/transport/checkout/CheckoutBookingSummary";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseClient } from "@/lib/supabase"; // Client side
import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';

export default function TransportCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = useSupabaseClient();

    // Params
    const routeId = searchParams.get('routeId');
    const resumeBookingId = searchParams.get('bookingId');
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers') || '1';

    // State
    const [route, setRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            setLoading(true);

            // CASE 1: RESUME BOOKING -> Redirect to Global Checkout
            if (resumeBookingId) {
                router.push(`/payment?bookingId=${resumeBookingId}`);
                return;
            }

            // CASE 2: NEW BOOKING - Fetch Route
            if (routeId) {
                const { data, error } = await supabase
                    .from('transport_routes')
                    .select(`
                        *,
                        transport_providers (name, logo_url, rating)
                    `)
                    .eq('id', routeId)
                    .single();

                if (error) {
                    toast.error("Không tìm thấy thông tin chuyến đi");
                } else {
                    setRoute(data);
                }
            }
            setLoading(false);
        };

        init();
    }, [routeId, resumeBookingId, supabase, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!route && !resumeBookingId) {
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
                <CheckoutHeader currentStep={1} />

                <UnifiedCheckoutContainer
                    serviceType="transport"
                    initialData={{
                        route,
                        passengers,
                        date
                    }}
                />

                <div className="flex justify-center gap-8 pt-4">
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Help Center</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
