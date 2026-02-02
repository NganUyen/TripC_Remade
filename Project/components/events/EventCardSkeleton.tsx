import { Skeleton } from "@/components/ui/skeleton"

export function EventCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-5 space-y-4">
                {/* Title and Badge */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                </div>

                {/* Info Rows */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-2/3 rounded-lg" />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
                    <Skeleton className="h-6 w-1/3 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>
        </div>
    )
}
