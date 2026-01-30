'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface OrderSummaryCardProps {
    items: any[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    className?: string;
    onContinue?: () => void;
    isLoading?: boolean;
}

export const OrderSummaryCard = ({
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    className,
    onContinue,
    isLoading
}: OrderSummaryCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const fmt = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className={cn("bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 space-y-8", className)}>

            {/* Header (Mobile Toggle) */}
            <div
                className="flex items-center justify-between md:hidden cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="font-semibold text-slate-900 dark:text-white">Order Summary</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{fmt(total)}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </div>
            </div>

            {/* Content Content - Always visible Desktop, toggle Mobile */}
            <div className={cn("space-y-8", isExpanded ? "block" : "hidden md:block")}>
                {/* Items List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                            <div className="relative w-14 h-14 rounded-lg bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100" />
                                )}
                                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-bl-md font-bold">
                                    {item.quantity}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                    {item.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    {fmt(item.price)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Shipping</span>
                        <span className="text-green-600">{shippingCost === 0 ? 'Free' : fmt(shippingCost)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-slate-500">
                            <span>Discount</span>
                            <span className="text-red-600">-{fmt(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                        <div className="text-right">
                            <span className="text-xl font-bold text-slate-900 dark:text-white block">
                                {fmt(total)}
                            </span>
                            <span className="text-[10px] text-slate-400">USD (Incl. Tax)</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                {onContinue && (
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={isLoading}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to Payment
                    </button>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Secure SSL Encrypted
                </div>
            </div>
        </div>
    );
};
