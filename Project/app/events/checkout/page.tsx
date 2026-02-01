'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EventCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Parse from query params
    const eventId = searchParams.get('eventId');
    const sessionId = searchParams.get('sessionId');
    const ticketTypeId = searchParams.get('ticketTypeId');
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!eventId || !sessionId || !ticketTypeId) {
            toast.error('Missing booking details');
            router.push('/events');
            return;
        }
        setIsValid(true);
    }, [eventId, sessionId, ticketTypeId, router]);

    if (!isValid) {
        return (
            <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-pulse text-slate-500">Loading...</div>
            </div>
        );
    }

    // Initial Data for the Form
    const initialData = {
        eventId: eventId!,
        sessionId: sessionId!,
        ticketTypeId: ticketTypeId!,
        adults,
        children
    };

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] py-12">
            <div className="container mx-auto px-4 mb-6">
                <Link 
                    href={`/events/${eventId}`}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Event Details
                </Link>
            </div>

            <UnifiedCheckoutContainer
                serviceType="event"
                initialData={initialData}
            />
        </div>
    );
}
