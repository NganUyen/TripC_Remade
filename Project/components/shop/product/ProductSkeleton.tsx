import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
                {/* Main Product Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Gallery Skeleton */}
                        <div className="lg:col-span-5 space-y-4">
                            <Skeleton className="aspect-square rounded-[2rem] w-full" />
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="w-20 h-20 rounded-2xl flex-shrink-0" />
                                ))}
                            </div>
                        </div>

                        {/* Info Skeleton */}
                        <div className="lg:col-span-7 space-y-6">
                            <Skeleton className="h-8 w-3/4 rounded-full" />
                            <Skeleton className="h-6 w-1/4 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full rounded-full" />
                                <Skeleton className="h-4 w-5/6 rounded-full" />
                            </div>
                            {/* Price & Cart */}
                            <div className="pt-8 flex gap-4">
                                <Skeleton className="h-16 w-full max-w-md rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Info Skeleton */}
                <Skeleton className="h-32 w-full rounded-[2rem]" />

                {/* Description & Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9 space-y-8">
                        <Skeleton className="h-96 w-full rounded-[2rem]" />
                        <Skeleton className="h-64 w-full rounded-[2rem]" />
                    </div>
                    <div className="lg:col-span-3 hidden lg:block">
                        <Skeleton className="h-[600px] w-full rounded-[2rem]" />
                    </div>
                </div>
            </div>
        </main>
    )
}
