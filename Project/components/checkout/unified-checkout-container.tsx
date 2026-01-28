'use client';

import { useState } from 'react';
import { useUnifiedCheckout } from '@/hooks/checkout/use-unified-checkout';
import { ServiceType, CheckoutPayload } from '@/lib/checkout/types';
import { CheckoutFormFactory } from './checkout-form-factory'; // Assumed exists or needs check
import { PaymentMethodSelector } from './payment-method-selector'; // Assumed exists
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface Props {
    serviceType: ServiceType;
    initialData?: any;
}

export const UnifiedCheckoutContainer = ({ serviceType, initialData }: Props) => {
    const { user } = useUser();
    const { initializeCheckout, initiatePayment, isLoading } = useUnifiedCheckout();

    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [bookingId, setBookingId] = useState<string | null>(null);

    const handleDetailsSubmit = async (details: any) => {
        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        const payload: CheckoutPayload = {
            serviceType,
            userId: user.id, // Clerk ID
            currency: 'VND', // Default
            ...details
        };

        const result = await initializeCheckout(payload);
        if (result) {
            setBookingId(result.bookingId);
            setStep('payment');
        }
    };

    const handlePaymentSelect = async (method: string) => {
        if (!bookingId) return;
        if (method === 'momo' || method === 'paypal') {
            await initiatePayment(bookingId, method);
        } else {
            toast.info('This method is coming soon');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-2xl font-bold mb-8 capitalize">Checkout: {serviceType}</h1>

            {step === 'details' && (
                <CheckoutFormFactory
                    serviceType={serviceType}
                    initialData={initialData}
                    onSubmit={handleDetailsSubmit}
                />
            )}

            {step === 'payment' && (
                <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-300 mb-6">
                        Booking Created! ID: {bookingId}
                    </div>
                    <PaymentMethodSelector onSelect={handlePaymentSelect} disabled={isLoading} />
                </div>
            )}
        </div>
    );
};
