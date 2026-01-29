'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
    onSelect: (method: string) => void;
    disabled?: boolean;
    defaultValue?: string | null;
}

const springTransition = { type: "spring", stiffness: 400, damping: 25 };

const paymentMethods = [
    {
        id: 'momo',
        name: 'MoMo Wallet',
        subtitle: 'Thanh toán qua ví điện tử MoMo',
        image: '/assets/payment/momo-logo.png',
        bgColor: 'bg-[#A50064]/5',
        borderColor: 'border-[#A50064]',
    },
    {
        id: 'paypal',
        name: 'PayPal',
        subtitle: 'Thanh toán quốc tế (Visa/Master)',
        image: '/assets/payment/paypal-logo.png',
        bgColor: 'bg-[#003087]/5',
        borderColor: 'border-[#003087]',
    }
];

export const PaymentMethodSelector = ({ onSelect, disabled, defaultValue }: Props) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(defaultValue || null);

    useEffect(() => {
        if (defaultValue) {
            setSelectedMethod(defaultValue);
        }
    }, [defaultValue]);

    const handleSelect = (methodId: string) => {
        if (disabled) return;
        setSelectedMethod(methodId);
        onSelect(methodId);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    Select Payment Method
                </h3>
            </div>

            {/* Payment Methods Grid */}
            <div className="space-y-3">
                {paymentMethods.map((method, index) => {
                    const isSelected = selectedMethod === method.id;

                    return (
                        <div key={method.id} className="relative">
                            <button
                                onClick={() => handleSelect(method.id)}
                                disabled={disabled}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                                    ${isSelected
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-600/20'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Logo */}
                                <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg border border-slate-100 p-1.5 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={method.image}
                                            alt={method.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                            {method.name}
                                        </h4>
                                        {isSelected ? (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

