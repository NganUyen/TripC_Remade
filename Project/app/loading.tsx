"use client"

export default function Loading() {
    return (
        <div className="flex-grow animate-pulse">
            {/* Hero Skeleton */}
            <div className="relative w-full h-[60vh] bg-slate-200 dark:bg-slate-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                    <div className="h-10 w-3/4 max-w-xl bg-slate-300 dark:bg-slate-700 rounded-xl mb-4" />
                    <div className="h-6 w-1/2 max-w-md bg-slate-300 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
