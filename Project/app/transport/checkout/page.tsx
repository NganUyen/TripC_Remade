"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useSupabaseClient } from "@/lib/supabase"; // Client side
import { useClerk, useUser } from "@clerk/nextjs";
import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';

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
    const [initialBooking, setInitialBooking] = useState<any>(null);

    // Initial Load - Fetch Data for Props
    useEffect(() => {
        const init = async () => {
            setLoading(true);

            // CASE 1: RESUME BOOKING
            if (resumeBookingId) {
                // Fetch safely via API if we wanted to be consistent, but for 'initialData' loading
                // we might just let the container handle it? 
                // Actually UnifiedContainer expects 'initialData' to be the *Product* details for the form,
                // OR if it's a resume, it might expect the Booking itself.

                // For now, let's stick to the Route logic which populates the FORM.
                // If resuming a booking that is already created (step 2), 
                // The UnifiedContainer usually handles "Step 2" if we pass a bookingId?
                // Looking at UnifiedContainer: 
                // const [step, setStep] = useState<'details' | 'payment'>('details');
                // if (bookingId) ... setStep('payment').

                // So if we have resumeBookingId, we should fetch it to verify, then pass it?
                // Or simply let the user re-enter details if it's 'details' step?
                // The prompt says "Redirect to Unified Payment Page" for step 2.
                // So this page is primarily STEP 1 (Details).
                // If resumeBookingId exists (Step 2), we should probably redirect to /payment?bookingId=... 
                // to use the CENTRAL payment page, matching our "Pattern B" discussion?
                // OR we render UnifiedContainer in "payment" mode?

                // Let's redirect to central payment if resuming, to keep it simple as per previous cleanup.
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-20">
            {/* Header is inside the Container or we keep it? 
                 UnifiedContainer has "CheckoutSteps". 
                 Transport had "CheckoutHeader". 
                 Let's use UnifiedContainer. It renders CheckoutSteps if serviceType is 'shop'. 
                 We might need to enable it for 'transport' too in UnifiedContainer or let it be.
                 The user wants "Unified".
             */}

            <div className="mb-4">
                <Link href="/transport" className="container mx-auto px-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
                    ← Back to Search
                </Link>
            </div>

            <UnifiedCheckoutContainer
                serviceType="transport"
                initialData={{
                    route,
                    passengers,
                    date
                }}
            />
        </div>
    );
}



