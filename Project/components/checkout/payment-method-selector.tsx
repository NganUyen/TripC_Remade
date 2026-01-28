'use client';

import { motion } from 'framer-motion';
import {
    Smartphone,
    Wallet,
    CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    onSelect: (method: string) => void;
    disabled?: boolean;
}

const springTransition = { type: "spring", stiffness: 400, damping: 25 };

const paymentMethods = [
    {
        id: 'momo',
        name: 'MoMo Wallet',
        subtitle: 'Thanh toán qua ví điện tử',
        icon: Smartphone,
        color: 'pink'
    },
    {
        id: 'paypal',
        name: 'PayPal',
        subtitle: 'Thanh toán quốc tế',
        icon: Wallet,
        color: 'blue'
    }
];

export const PaymentMethodSelector = ({ onSelect, disabled }: Props) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handleSelect = (methodId: string) => {
        setSelectedMethod(methodId);
        onSelect(methodId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Phương thức thanh toán
                </h3>
                <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
                    Chọn phương thức thanh toán an toàn và tiện lợi nhất cho bạn.
                </p>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method, index) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <motion.div
                            key={method.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...springTransition, delay: index * 0.1 }}
                            className="group h-full"
                            whileHover={{ y: -2 }}
                        >
                            <button
                                onClick={() => handleSelect(method.id)}
                                disabled={disabled}
                                className={`
                                    relative w-full h-full p-5 
                                    bg-white dark:bg-slate-900 
                                    rounded-2xl
                                    border-2 transition-all duration-300
                                    flex flex-col items-start gap-4
                                    ${isSelected
                                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/10'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Selected Indicator */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="selected-indicator"
                                        className="absolute top-4 right-4"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={springTransition}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
                                    </motion.div>
                                )}

                                {/* Icon */}
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center
                                    transition-colors duration-300
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : method.color === 'pink'
                                            ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }
                                `}>
                                    <Icon className="w-6 h-6" strokeWidth={2} />
                                </div>

                                {/* Text */}
                                <div className="text-left space-y-1">
                                    <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                        {method.name}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {method.subtitle}
                                    </p>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
