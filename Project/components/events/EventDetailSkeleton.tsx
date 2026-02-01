import { Skeleton } from "@/components/ui/skeleton"

export function EventDetailSkeleton() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row h-auto lg:h-[400px]">
                    <div className="flex-1 p-10 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-12 w-2/3 rounded-lg" />
                            <div className="grid grid-cols-2 gap-6">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 mt-6">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-12 flex-1 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="w-full lg:w-[400px] h-[300px] lg:h-auto bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 my-8 pb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <Skeleton className="h-64 w-full rounded-[2rem]" />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-[400px]">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <Skeleton className="h-10 w-32" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-14 w-full rounded-[1.5rem]" />
                                <Skeleton className="h-20 w-full rounded-[1.5rem]" />
                                <Skeleton className="h-12 w-full rounded-[1.5rem]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
