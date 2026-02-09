"use client"

export function LoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                    >
                        {Array.from({ length: columns }).map((_, j) => (
                            <div
                                key={j}
                                className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"
                                style={{ maxWidth: j === 0 ? '40%' : '20%' }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
