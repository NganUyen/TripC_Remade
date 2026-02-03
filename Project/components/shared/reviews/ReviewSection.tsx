"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { MessageSquare, ChevronDown, Loader2 } from "lucide-react"
import { ReviewStats } from "./ReviewStats"
import { ReviewItem } from "./ReviewItem"
import { ReviewForm } from "./ReviewForm"
import { reviewsApi } from "@/lib/reviews/api"
import type { Review, ReviewStats as ReviewStatsType } from "@/lib/reviews/types"

interface ReviewSectionProps {
    entityId: string
    entityType: string
    title?: string
    className?: string
}

export function ReviewSection({ entityId, entityType, title = "Reviews & Ratings", className = "" }: ReviewSectionProps) {
    const { user } = useUser()
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStatsType | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const limit = 10

    const fetchReviews = async (newOffset: number = 0, append: boolean = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }

        try {
            const response = await reviewsApi.getReviews(entityType, entityId, limit, newOffset)
            const fetchedReviews = response.reviews || []

            if (append) {
                setReviews((prev) => [...prev, ...fetchedReviews])
            } else {
                setReviews(fetchedReviews)
                setStats(response.stats || null)
            }

            setHasMore(response.has_more)
            setOffset(newOffset)
        } catch (err) {
            console.error("Error fetching reviews:", err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        if (entityId && entityType) {
            fetchReviews(0)
        }
    }, [entityId, entityType])

    const handleLoadMore = () => {
        fetchReviews(offset + limit, true)
    }

    const handleReviewSuccess = () => {
        setShowForm(false)
        fetchReviews(0)
    }

    const handleHelpful = async (reviewId: string) => {
        // Optimistic update
        setReviews((prev) =>
            prev.map((r) =>
                r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
            )
        )
        // TODO: Call API to persist helpful count
    }

    if (loading) {
        return (
            <section className={`py-8 ${className}`}>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </section>
        )
    }

    return (
        <section className={`py-8 space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                    {title}
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    disabled={!user}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {user ? "Write a Review" : "Sign in to Review"}
                </button>
            </div>

            {showForm && (
                <ReviewForm
                    entityId={entityId}
                    entityType={entityType}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <ReviewStats stats={stats} />

            {reviews.length > 0 ? (
                <div className="space-y-0">
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onHelpful={handleHelpful}
                        />
                    ))}

                    {hasMore && (
                        <div className="pt-6 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Load More Reviews
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
                    <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        No reviews yet. Be the first to share your experience!
                    </p>
                </div>
            )}
        </section>
    )
}
