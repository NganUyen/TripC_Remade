"use client"

import { useState } from 'react'
import { useReviews, useReviewsSummary } from '@/lib/hooks/useShopAPI'
import { ReviewSummaryComp } from './ReviewSummary'
import { ReviewFilters } from './ReviewFilters'
import { ReviewItem } from './ReviewItem'
import { Loader2, MessageSquare } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

interface ProductReviewsProps {
    slug: string
}

export function ProductReviews({ slug }: ProductReviewsProps) {
    const [rating, setRating] = useState<number | undefined>(undefined)
    const [hasPhotos, setHasPhotos] = useState(false)
    const [offset, setOffset] = useState(0)
    const limit = 5

    const { summary, loading: summaryLoading } = useReviewsSummary(slug)
    const { reviews, total, loading: reviewsLoading } = useReviews(slug, {
        rating,
        has_photos: hasPhotos,
        limit,
        offset
    })

    const handlePageChange = (newOffset: number) => {
        setOffset(newOffset)
        // Smooth scroll to top of reviews section
        const element = document.getElementById('reviews-section')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    if (summaryLoading && !summary) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Summary Skeleton */}
                    <div className="w-full md:w-1/3 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl h-48" />
                    {/* Bars Skeleton */}
                    <div className="w-full md:w-2/3 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div id="reviews-section" className="space-y-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ratings & Reviews</h2>

            {summary ? (
                <>
                    <ReviewSummaryComp summary={summary} />

                    <ReviewFilters
                        currentRating={rating}
                        hasPhotos={hasPhotos}
                        counts={summary.rating_distribution}
                        totalCount={total}
                        onRatingChange={(r) => {
                            setRating(r)
                            setOffset(0)
                        }}
                        onHasPhotosChange={(h) => {
                            setHasPhotos(h)
                            setOffset(0)
                        }}
                    />

                    <div className="space-y-4">
                        {reviewsLoading ? (
                            <div className="space-y-6 opacity-50 pointer-events-none">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-slate-50 dark:bg-white/5 h-32 rounded-2xl" />
                                ))}
                            </div>
                        ) : reviews.length > 0 ? (
                            <>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {reviews.map((review) => (
                                        <ReviewItem key={review.id} review={review} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {total > limit && (
                                    <div className="flex justify-center items-center gap-2 pt-8">
                                        <button
                                            disabled={offset === 0}
                                            onClick={() => handlePageChange(Math.max(0, offset - limit))}
                                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="text-sm font-medium text-slate-500">
                                            Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                                        </div>
                                        <button
                                            disabled={offset + limit >= total}
                                            onClick={() => handlePageChange(offset + limit)}
                                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No reviews match your selected filters.</p>
                                <button
                                    onClick={() => {
                                        setRating(undefined)
                                        setHasPhotos(false)
                                    }}
                                    className="mt-4 text-[#FF5E1F] font-bold text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No reviews yet for this product.</p>
                </div>
            )}
        </div>
    )
}
