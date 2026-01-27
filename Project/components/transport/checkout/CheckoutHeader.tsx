"use client";

interface CheckoutHeaderProps {
    currentStep?: 1 | 2 | 3;
}

export function CheckoutHeader({ currentStep = 1 }: CheckoutHeaderProps) {
    return (
        <div className="flex flex-col items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
                <div className="size-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">trip_origin</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tighter">TripC Pro</span>
            </div>
            <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-white/5 rounded-full border border-border-subtle dark:border-white/10 shadow-sm">
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary text-white' : 'text-charcoal/40 dark:text-white/40'}`}>
                    <span className="text-xs font-bold leading-none">1</span>
                    <span className="text-sm font-extrabold">Details</span>
                </div>
                <div className="w-8 h-px bg-gray-200 dark:bg-white/20"></div>
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary text-white' : 'text-charcoal/40 dark:text-white/40'}`}>
                    <span className="text-xs font-bold leading-none">2</span>
                    <span className="text-sm font-bold">Payment</span>
                </div>
                <div className="w-8 h-px bg-gray-200 dark:bg-white/20"></div>
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full transition-colors ${currentStep >= 3 ? 'bg-primary text-white' : 'text-charcoal/40 dark:text-white/40'}`}>
                    <span className="text-xs font-bold leading-none">3</span>
                    <span className="text-sm font-bold">Review</span>
                </div>
            </div>
        </div>
    );
}
