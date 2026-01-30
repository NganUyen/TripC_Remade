import { Skeleton } from "@/components/ui/skeleton"

export function BookingListSkeleton() {
    return (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-transparent dark:border-white/5 h-[320px] flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <Skeleton className="w-24 h-6 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="mb-6 space-y-3">
                        <Skeleton className="w-32 h-4 rounded-full" />
                        <Skeleton className="w-full h-8 rounded-lg" />
                        <Skeleton className="w-2/3 h-8 rounded-lg" />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-end justify-between pt-6">
                        <div className="space-y-2">
                            <Skeleton className="w-24 h-4 rounded-full" />
                        </div>
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}
