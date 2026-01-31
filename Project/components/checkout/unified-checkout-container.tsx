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
import { TermsAndConditions } from './terms-and-conditions';
import { cn } from '@/lib/utils';

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
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
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
            console.log('[UnifiedCheckout] Setting Booking Amount:', result.totalAmount);
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
        // Terms Check
        if (!isTermsAccepted) {
            toast.error("Vui lòng đồng ý với điều khoản dịch vụ trước khi thanh toán.");
            return;
        }

        setPaymentMethod(method);
        if (!bookingId) return;

        // Currency Mismatch Guard
        // 1. USD -> MoMo/VNPAY (Needs conversion to VND)
        // 2. VND -> PayPal (Needs conversion to USD)
        const isUsdToMomo = bookingCurrency === 'USD' && (method === 'momo' || method === 'vnpay');
        const isVndToPaypal = bookingCurrency === 'VND' && method === 'paypal';

        if (isUsdToMomo || isVndToPaypal) {
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
            let vnAmount = bookingAmount;
            if (bookingCurrency === 'USD') {
                const { convertUsdToVnd } = await import('@/lib/utils/currency');
                vnAmount = convertUsdToVnd(bookingAmount);
            }

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
        <div className="max-w-4xl mx-auto px-4 md:px-0 pb-12">

            {(serviceType === 'shop' || serviceType === 'transport') && (
                <CheckoutSteps
                    currentStep={getCurrentStep()}
                    className="mb-8"
                    steps={serviceType === 'transport'
                        ? [
                            { id: 'details', label: 'Info' },
                            { id: 'payment', label: 'Payment' }
                        ]
                        : undefined // Default for Shop (Cart > Info > Payment)
                    }
                />
            )}

            {/* Step Title for Payment */}
            {step === 'payment' && (
                <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Thanh Toán Đơn Hàng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Vui lòng xem lại thông tin và xác nhận thanh toán
                    </p>
                </div>
            )}

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
                        <div className="space-y-8 max-w-lg mx-auto">

                            {/* 1. Terms Section (Scroll mandatory) */}
                            <TermsAndConditions
                                isAccepted={isTermsAccepted}
                                onAccept={() => setIsTermsAccepted(true)}
                                onDecline={() => setIsTermsAccepted(false)}
                            />

                            {/* Divider with Lock Icon */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-slate-50 dark:bg-slate-950 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Secure Payment
                                    </span>
                                </div>
                            </div>

                            {/* 2. Payment Method Selector (Disabled until accepted) */}
                            <div className={cn("transition-all duration-300", !isTermsAccepted && "opacity-50 grayscale pointer-events-none")}>
                                <PaymentMethodSelector onSelect={handlePaymentSelect} disabled={isLoading || !isTermsAccepted} defaultValue={paymentMethod} />
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
