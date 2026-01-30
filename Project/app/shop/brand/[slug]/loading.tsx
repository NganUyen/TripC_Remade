import { Loader2 } from "lucide-react"

export default function BrandLoading() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse mb-8" />

                {/* Tabs Skeleton */}
                <div className="flex gap-4 mb-8">
                    <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </main>
    )
}
