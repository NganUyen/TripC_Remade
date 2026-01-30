'use client';

import { useState } from 'react';
import { useUnifiedCheckout } from '@/hooks/checkout/use-unified-checkout';
import { ServiceType, CheckoutPayload } from '@/lib/checkout/types';
import { CheckoutFormFactory } from './checkout-form-factory';
import { PaymentMethodSelector } from './payment-method-selector';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CurrencyConversionInfo } from './CurrencyConversionInfo';
import { AnimatePresence, motion } from 'framer-motion';
import { CurrencyGuardModal } from './currency-guard-modal';
import { useRouter } from 'next/navigation';
import { convertUsdToVnd, EXCHANGE_RATE_USD_VND, formatCurrency } from '@/lib/utils/currency';
import { CheckoutSteps } from './checkout-steps';
import { ShopCheckoutSkeleton } from '@/components/checkout/forms/shop-checkout-skeleton';

interface Props {
    serviceType: ServiceType;
    initialData?: any;
}

export const UnifiedCheckoutContainer = ({ serviceType, initialData }: Props) => {
    const { user } = useUser();
    const { initializeCheckout, initiatePayment, isLoading } = useUnifiedCheckout();

    const [step, setStep] = useState<'details' | 'payment'>('details'); // TODO: Add 'cart' and 'complete' support if needed

    // Derived state for Steps component
    const getCurrentStep = () => {
        if (serviceType === 'shop' && !bookingId) return 'details'; // or 'cart' if we had previous step
        if (step === 'payment') return 'payment';
        return 'details';
    };
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [bookingAmount, setBookingAmount] = useState<number>(0);
    const [bookingCurrency, setBookingCurrency] = useState<string>('USD'); // Default Shop is USD
    const [showCurrencyGuard, setShowCurrencyGuard] = useState(false);
    const [pendingMethod, setPendingMethod] = useState<string | null>(null);
    const router = useRouter();

    const handleDetailsSubmit = async (details: any) => {
        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        const payload: CheckoutPayload = {
            serviceType,
            userId: user.id, // Clerk ID
            currency: 'USD', // Shop default to USD
            ...details
        };

        const result = await initializeCheckout(payload);
        if (result) {
            setBookingId(result.bookingId);
            // Use the amount returned from the backend/hook result
            if (result.totalAmount) {
                setBookingAmount(Number(result.totalAmount));
            }
            // Dynamic Currency from Result
            if (result.currency) {
                setBookingCurrency(result.currency);
            }
            setStep('payment');
        }
    };

    const handlePaymentSelect = async (method: string) => {
        setPaymentMethod(method);
        if (!bookingId) return;

        // Currency Mismatch Guard (USD -> MoMo)
        // If currency is USD and method is MoMo, show blocking modal.
        // We assume 'shop' uses USD by default as per line 36.
        if (bookingCurrency === 'USD' && method === 'momo') {
            setPendingMethod(method);
            setShowCurrencyGuard(true);
            return;
        }

        await processPayment(method);
    };

    const processPayment = async (method: string) => {
        if (!bookingId) return;

        // MoMo Limit Check (10,000,000 VND)
        if (method === 'momo') {
            const { convertUsdToVnd } = await import('@/lib/utils/currency');
            const vnAmount = convertUsdToVnd(bookingAmount);
            if (vnAmount > 10000000) {
                toast.error('MoMo payments are limited to 10,000,000 VND.');
                return;
            }
        }

        if (method === 'momo' || method === 'paypal') {
            // Use our modified initiatePayment which should return URL or we handle redirect
            // actually useUnifiedCheckout's initiatePayment does window.location.href.
            // We want to verify it redirects to a result page.
            // The hook currently hardcodes returnUrl: window.location.origin/my-bookings
            // We should override this if possible, or update the hook.
            // For now, let's assume we update the hook next.
            await initiatePayment(bookingId, method);
        } else {
            toast.info('This method is coming soon');
        }
    };

    const handleGuardProceed = () => {
        setShowCurrencyGuard(false);
        if (pendingMethod) {
            processPayment(pendingMethod);
            setPendingMethod(null);
        }
    };

    const handleGuardClose = () => {
        setShowCurrencyGuard(false);
        setPendingMethod(null);
        setPaymentMethod(null); // Deselect if cancelled
    };

    const handleGuardSwitch = (provider: string) => {
        setShowCurrencyGuard(false);
        setPendingMethod(null);
        handlePaymentSelect(provider);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">

            {serviceType === 'shop' && <CheckoutSteps currentStep={getCurrentStep()} className="mb-4" />}

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {step === 'details' ? 'Checkout' : 'Payment'}
                </h1>
            </div>

            {isLoading && !initialData && step === 'details' ? (
                <ShopCheckoutSkeleton />
            ) : (
                <>
                    {step === 'details' && (
                        <CheckoutFormFactory
                            serviceType={serviceType}
                            initialData={initialData}
                            onSubmit={handleDetailsSubmit}
                        />
                    )}

                    {step === 'payment' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300 mb-6">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-bold">Booking Created Successfully!</h3>
                                    <p className="text-sm opacity-90">Booking ID: <span className="font-mono">{bookingId}</span></p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <PaymentMethodSelector onSelect={handlePaymentSelect} disabled={isLoading} defaultValue={paymentMethod} />
                            </div>

                            {/* Currency Info */}
                            {paymentMethod === 'momo' && !showCurrencyGuard && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <CurrencyConversionInfo
                                        originalAmount={bookingAmount}
                                        sourceCurrency={bookingCurrency}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Currency Guard Modal */}
                    <CurrencyGuardModal
                        isOpen={showCurrencyGuard}
                        onClose={handleGuardClose}
                        onConfirm={handleGuardProceed}
                        onSwitchProvider={handleGuardSwitch}
                        amount={bookingAmount}
                        currency={bookingCurrency}
                        targetProvider={pendingMethod || ''}
                    />
                </>
            )}
        </div>
    );
};
