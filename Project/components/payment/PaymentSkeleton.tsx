import { Skeleton } from "@/components/ui/skeleton";

export function PaymentSkeleton() {
    return (
        <div className="max-w-2xl mx-auto animate-pulse">
            {/* Back Button Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-6 w-48" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                {/* Title & Info Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>

                {/* Booking Info Box Skeleton */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-2 flex flex-col items-end">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-7 w-32" />
                        </div>
                    </div>
                </div>

                {/* Policy Skeleton */}
                <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-border-subtle dark:border-white/10 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-lg" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>

                {/* Button */}
                <Skeleton className="h-16 w-full rounded-full" />
            </div>
        </div>
    );
}
