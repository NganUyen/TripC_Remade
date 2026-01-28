import { useState } from 'react';
import { CheckoutPayload, CheckoutResult } from '@/lib/checkout/types';
import { toast } from 'sonner';

export const useUnifiedCheckout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeCheckout = async (payload: CheckoutPayload): Promise<CheckoutResult | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/checkout/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Checkout initialization failed');
            }

            const data = await response.json();
            return data.data; // Expected { bookingId, status, ... }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const initiatePayment = async (bookingId: string, provider: 'momo' | 'vnpay') => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    provider,
                    returnUrl: `${window.location.origin}/my-bookings`
                })
            });

            if (!response.ok) throw new Error('Payment initiation failed');

            const { data } = await response.json();

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        initializeCheckout,
        initiatePayment,
        isLoading,
        error
    };
};
