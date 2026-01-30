'use client';

import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
    currentStep: 'cart' | 'details' | 'payment' | 'complete';
    className?: string;
}

const steps = [
    { id: 'cart', label: 'Cart' },
    { id: 'details', label: 'Info' },
    { id: 'payment', label: 'Payment' },
] as const;

export const CheckoutSteps = ({ currentStep, className }: CheckoutStepsProps) => {
    const getCurrentIndex = () => steps.findIndex(s => s.id === currentStep);
    const currentIndex = getCurrentIndex();

    return (
        <nav aria-label="Checkout Progress" className={cn("w-full py-2", className)}>
            <div className="flex items-center justify-center space-x-2 text-xs">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={step.id} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-3 h-3 text-slate-300 mx-2" />
                            )}

                            <div className={cn(
                                "flex items-center gap-1.5 transition-colors duration-300 font-medium",
                                isActive ? "text-slate-900 dark:text-white" : "text-slate-500",
                                isCompleted && "text-slate-900 dark:text-white"
                            )}>
                                {isCompleted ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                    <span className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full text-[9px] border",
                                        isActive
                                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white"
                                            : "border-slate-300 text-slate-300"
                                    )}>
                                        {index + 1}
                                    </span>
                                )}
                                <span className={cn(
                                    isActive && "font-bold"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};
