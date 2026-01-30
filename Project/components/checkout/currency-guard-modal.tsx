// "use client";

// import { Modal } from "@/components/ui/modal"; // Accessing standard modal if available, otherwise using custom motion
// Actually unified-checkout-container used inline Framer Motion. Let's keep it self-contained for now or use `dialog`.
// Let's stick to the inline style user liked, but componentized.

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Image from "next/image";
import { convertUsdToVnd, convertVndToUsd, EXCHANGE_RATE_USD_VND, formatCurrency } from "@/lib/utils/currency";

interface CurrencyGuardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onSwitchProvider?: (provider: string) => void;

    amount: number;
    currency: string; // 'USD' or 'VND'
    targetProvider: string; // 'momo', 'paypal', 'vnpay'
}

export function CurrencyGuardModal({
    isOpen,
    onClose,
    onConfirm,
    onSwitchProvider,
    amount,
    currency,
    targetProvider
}: CurrencyGuardModalProps) {
    if (!isOpen) return null;

    // Logic for conversion
    const isSourceUsd = currency === 'USD';
    const isTargetMomo = targetProvider === 'momo' || targetProvider === 'vnpay'; // These support VND
    const isTargetPaypal = targetProvider === 'paypal'; // Supports USD

    // If source is USD and target is Momo => Convert to VND
    // If source is VND and target is Paypal => Convert to USD

    // Determine context
    let title = "";
    let message = "";
    let breakdown = null;
    let switchButton = null;

    if (isSourceUsd && isTargetMomo) {
        title = "Currency Mismatch";
        message = `Total is ${formatCurrency(amount, 'USD')} (USD). You are about to pay with ${targetProvider === 'momo' ? 'MoMo' : 'VNPAY'}.`;

        breakdown = (
            <div className="flex flex-col gap-2">
                <p>{targetProvider === 'momo' ? 'MoMo' : 'VNPAY'} primarily supports VND. We will convert this amount to VND automatically:</p>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center mt-1">
                    <span className="text-slate-500">Exchange Rate</span>
                    <span className="font-mono font-medium">1 USD ≈ {formatCurrency(EXCHANGE_RATE_USD_VND, 'VND')}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">Converted Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white text-lg">
                        {formatCurrency(convertUsdToVnd(amount), 'VND')}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    <strong>PayPal</strong> is recommended for USD transactions to avoid conversion fees.
                </p>
            </div>
        );

        if (onSwitchProvider) {
            switchButton = (
                <button
                    onClick={() => onSwitchProvider('paypal')}
                    className="w-full bg-[#003087] hover:bg-[#00256b] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Image src="/assets/payment/paypal-logo.png" width={20} height={20} alt="PayPal" className="brightness-0 invert" />
                    Switch to PayPal (Recommended)
                </button>
            );
        }
    } else if (currency === 'VND' && isTargetPaypal) {
        title = "Currency Conversion";
        message = `Total is ${formatCurrency(amount, 'VND')}. PayPal requires USD.`;

        breakdown = (
            <div className="flex flex-col gap-2">
                <p>We will convert this amount to USD automatically:</p>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center mt-1">
                    <span className="text-slate-500">Exchange Rate</span>
                    <span className="font-mono font-medium">{formatCurrency(EXCHANGE_RATE_USD_VND, 'VND')} ≈ 1 USD</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">Converted Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white text-lg">
                        {formatCurrency(convertVndToUsd(amount), 'USD')}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    <strong>MoMo</strong> or <strong>VNPAY</strong> is recommended for VND transactions.
                </p>
            </div>
        );

        if (onSwitchProvider) {
            switchButton = (
                <button
                    onClick={() => onSwitchProvider('momo')}
                    className="w-full bg-[#A50064] hover:bg-[#860051] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    {/* Assuming icon availability or just text */}
                    Switch to MoMo (Recommended)
                </button>
            );
        }
    } else {
        // Fallback for unexpected cases
        title = "Confirm Payment";
        message = `Proceed with ${targetProvider.toUpperCase()}?`;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl z-10 border border-slate-200 dark:border-slate-800"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">{message}</strong>
                            </p>
                        </div>

                        {breakdown && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                                {breakdown}
                            </div>
                        )}

                        <div className="space-y-3">
                            {switchButton}

                            <button
                                onClick={onConfirm}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${switchButton
                                    ? 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                                    : 'bg-primary text-white hover:bg-primary/90'
                                    }`}
                            >
                                Proceed with {targetProvider === 'momo' ? 'MoMo' : targetProvider === 'paypal' ? 'PayPal' : 'VNPAY'}
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
