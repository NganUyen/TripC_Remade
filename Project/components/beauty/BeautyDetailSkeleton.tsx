import { Skeleton } from "@/components/ui/skeleton"

export function BeautyDetailSkeleton() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-safe">
            {/* Hero Skeleton */}
            <div className="relative w-full h-[50vh] min-h-[400px] md:h-[600px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-b-[2.5rem] md:rounded-b-[4rem] overflow-hidden">
                <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 lg:left-40 max-w-3xl w-full pr-6">
                    <Skeleton className="h-12 md:h-20 w-3/4 mb-6 bg-slate-300 dark:bg-slate-700" />
                    <Skeleton className="h-4 md:h-6 w-1/2 bg-slate-300 dark:bg-slate-700" />
                    <Skeleton className="h-4 md:h-6 w-1/2 mt-2 bg-slate-300 dark:bg-slate-700" />
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative">

                    {/* Main Content Column */}
                    <div className="flex-1 space-y-12 md:space-y-16 min-w-0">
                        {/* Highlights Skeleton */}
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-slate-800" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                                ))}
                            </div>
                        </div>

                        {/* Description Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-32 mb-6 bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-3 pt-4">
                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                                <Skeleton className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800" />
                            </div>
                        </div>

                        {/* Ritual Skeleton */}
                        <div className="space-y-8">
                            <Skeleton className="h-8 w-48 mx-auto bg-slate-200 dark:bg-slate-800" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-3">
                                        <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:w-[380px] xl:w-[420px] shrink-0">
                        <Skeleton className="h-[600px] w-full rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
                    </div>
                </div>
            </main>
        </div>
    )
}
