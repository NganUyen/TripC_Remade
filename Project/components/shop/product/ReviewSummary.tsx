"use client"

import { Star } from 'lucide-react'
import type { ReviewSummary } from '@/lib/hooks/useShopAPI'

interface ReviewSummaryProps {
    summary: ReviewSummary
}

export function ReviewSummaryComp({ summary }: ReviewSummaryProps) {
    const totalReviews = summary.review_count;

    return (
        <div className="flex flex-col md:flex-row gap-8 md:items-center bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Left: Score */}
            <div className="flex flex-col items-center text-center px-4">
                <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                    {summary.rating_avg.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(summary.rating_avg) ? 'fill-[#FF5E1F] text-[#FF5E1F]' : 'fill-slate-200 text-slate-200'}`}
                        />
                    ))}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Based on {totalReviews} reviews
                </div>
            </div>

            {/* Right: Distribution */}
            <div className="flex-1 space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.rating_distribution[star] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                        <div key={star} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 min-w-[3rem]">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{star}</span>
                                <Star className="w-3 h-3 fill-[#FF5E1F] text-[#FF5E1F]" />
                            </div>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#FF5E1F] transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[1.5rem] text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
