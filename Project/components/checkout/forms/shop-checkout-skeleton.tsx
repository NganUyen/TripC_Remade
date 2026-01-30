import { Skeleton } from "@/components/ui/skeleton";

export const ShopCheckoutSkeleton = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-pulse">
            {/* Left Column Skeletons */}
            <div className="w-full lg:flex-1 space-y-6">
                {/* Buyer Info Skeleton */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-40 mt-6" />
                </div>

                {/* Shipping Method Skeleton */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl opacity-50" />
                    </div>
                </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
                    <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                    <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                    <div className="flex justify-between mt-4 md:mt-0 pt-2 border-t border-gray-200"><Skeleton className="h-6 w-20" /><Skeleton className="h-8 w-24" /></div>
                </div>
                <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
        </div>
    );
};
