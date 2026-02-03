import { Star } from "lucide-react"
import type { ReviewStats as ReviewStatsType } from "@/lib/reviews/types"

interface ReviewStatsProps {
    stats: ReviewStatsType | null
}

export function ReviewStats({ stats }: ReviewStatsProps) {
    if (!stats) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
            <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="text-5xl font-display font-black text-zinc-900 dark:text-white mb-2">
                    {stats.average_rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(stats.average_rating)
                                    ? "fill-current"
                                    : "text-zinc-200 dark:text-zinc-700"
                                }`}
                        />
                    ))}
                </div>
                <p className="text-zinc-500 text-sm font-medium">
                    Based on {stats.total_reviews} reviews
                </p>
            </div>

            <div className="space-y-2 py-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution] || 0
                    const total = stats.total_reviews || 1
                    const percentage = (count / total) * 100

                    return (
                        <div key={rating} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-3 text-zinc-500">{rating}</span>
                            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium w-8 text-right text-zinc-400">
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
