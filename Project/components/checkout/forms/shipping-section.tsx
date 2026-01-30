'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface ShippingSectionProps {
    selectedMethodId: string;
    onSelect: (id: string) => void;
    className?: string;
}

const SHIPPING_METHODS = [
    {
        id: 'method_standard',
        name: 'Standard Delivery',
        eta: '3-5 business days',
        price: 0,
    },
    {
        id: 'method_express',
        name: 'Express Delivery',
        eta: 'Next day delivery',
        price: 5,
        disabled: true
    }
];

export const ShippingSection = ({ selectedMethodId, onSelect, className }: ShippingSectionProps) => {
    return (
        <section className={cn("space-y-4", className)}>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Shipping Method</h3>
            </div>

            <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    const isDisabled = method.disabled;

                    return (
                        <div
                            key={method.id}
                            onClick={() => !isDisabled && onSelect(method.id)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border",
                                isSelected
                                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50",
                                isDisabled && "opacity-50 cursor-not-allowed bg-slate-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {isSelected ? (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-100 dark:fill-blue-900" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300" />
                                )}
                                <div>
                                    <p className={cn("text-sm font-medium", isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white")}>
                                        {method.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {method.eta}
                                    </p>
                                </div>
                            </div>

                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
