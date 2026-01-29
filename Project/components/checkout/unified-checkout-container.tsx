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
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

    const handleGuardCancel = () => {
        setShowCurrencyGuard(false);
        setPendingMethod(null);
        setPaymentMethod(null); // Deselect
    };

    const handleGuardSwitch = () => {
        setShowCurrencyGuard(false);
        setPendingMethod(null);
        handlePaymentSelect('paypal'); // Switch to PayPal
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
                    <AnimatePresence>
                        {showCurrencyGuard && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    onClick={handleGuardCancel}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
                                >
                                    <button
                                        onClick={handleGuardCancel}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>

                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-500">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            Currency Mismatch
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Total is <strong className="text-slate-900 dark:text-white">${bookingAmount} (USD)</strong>. You are about to pay with MoMo.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex flex-col gap-2">
                                            <p>MoMo primarily supports VND. We will convert this amount to VND automatically:</p>
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center mt-1">
                                                <span className="text-slate-500">Exchange Rate</span>
                                                <span className="font-mono font-medium">1 USD ≈ {formatCurrency(EXCHANGE_RATE_USD_VND, 'VND')}</span>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center">
                                                <span className="text-slate-500">Converted Amount</span>
                                                <span className="font-bold text-slate-900 dark:text-white text-lg">
                                                    {formatCurrency(convertUsdToVnd(bookingAmount), 'VND')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                <strong>PayPal</strong> is recommended for USD transactions to avoid conversion fees.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleGuardSwitch}
                                            className="w-full bg-[#003087] hover:bg-[#00256b] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Image src="/assets/payment/paypal-logo.png" width={20} height={20} alt="PayPal" className="brightness-0 invert" />
                                            Switch to PayPal (Recommended)
                                        </button>

                                        <button
                                            onClick={handleGuardProceed}
                                            className="w-full bg-white dark:bg-slate-900 border-2 border-[#A50064] text-[#A50064] py-4 rounded-xl font-bold hover:bg-[#A50064]/5 transition-all"
                                        >
                                            Proceed with MoMo
                                        </button>

                                        <button
                                            onClick={handleGuardCancel}
                                            className="w-full py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};
