'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const status = searchParams.get('status'); // success, failed, canceled
    const bookingId = searchParams.get('bookingId');
    const errorCode = searchParams.get('errorCode');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400"
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Payment Successful!</h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Thank you for your booking. Your payment has been processed successfully.
                            </p>
                        </div>

                        {bookingId && (
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-w-sm mx-auto">
                                <p className="text-sm text-slate-500">Booking Reference</p>
                                <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">{bookingId}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="/my-bookings"
                                className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                View My Bookings
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                );

            case 'failed':
            case 'error':
                return (
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400"
                        >
                            <XCircle className="w-12 h-12" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Payment Failed</h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                We couldn't process your payment. Please try again or use a different payment method.
                            </p>
                            {errorCode && (
                                <p className="text-sm text-red-500 font-mono bg-red-50 dark:bg-red-900/10 inline-block px-3 py-1 rounded-full">
                                    Error: {errorCode}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Try Again
                            </button>
                            <Link
                                href="/help-center"
                                className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                );

            case 'canceled':
                return (
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-yellow-600 dark:text-yellow-400"
                        >
                            <AlertCircle className="w-12 h-12" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Payment Canceled</h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                You canceled the payment process. No charges were made.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4" />
                                Return to Checkout
                            </button>
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Loading status...</h1>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-black">
                {renderContent()}
            </div>
        </div>
    );
}
