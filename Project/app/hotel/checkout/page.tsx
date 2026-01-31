
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function HotelCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();


    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');

    // Parse Booking Intent
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!hotelId || !roomId || !checkIn || !checkOut) {
            toast.error('Missing booking details');
            router.push('/');
            return;
        }
        setIsValid(true);
    }, [hotelId, roomId, checkIn, checkOut, router]);

    if (!isValid) return null; // Or skeleton

    // Initial Data for the Form
    const initialData = {
        hotelId: hotelId!,
        roomId: roomId!,
        dates: {
            start: checkIn!,
            end: checkOut!
        },
        guests: {
            adults,
            children
        },
        rate: 100 // Mock/Default for display, Server is authority
    };

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] py-12">
            <div className="container mx-auto px-4 mb-4">
                <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition-colors">
                    ← Back to Hotel Details
                </button>
            </div>

            <UnifiedCheckoutContainer
                serviceType="hotel"
                initialData={initialData}
            />
        </div>
    );
}
