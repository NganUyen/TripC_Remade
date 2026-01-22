export default function ProductLoading() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
                {/* Main Product Card Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Gallery Skeleton */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                ))}
                            </div>
                        </div>

                        {/* Info Skeleton */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4" />
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6" />
                            </div>
                            <div className="pt-8 flex gap-4">
                                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-full w-32" />
                                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-full w-12" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Info Skeleton */}
                <div className="h-32 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800" />
            </div>
        </main>
    )
}
