import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Star, Upload, X, Loader2 } from "lucide-react"
import { reviewsApi } from "@/lib/reviews/api"
import type { Review } from "@/lib/reviews/types"

interface ReviewFormProps {
    entityId: string
    entityType: string
    onSubmit?: (data: any) => Promise<any>
    onSuccess?: () => void
    onCancel?: () => void
}

export function ReviewForm({ entityId, entityType, onSuccess, onCancel }: ReviewFormProps) {
    const { user } = useUser()
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [title, setTitle] = useState("")
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // TODO: Add image upload logic if needed. 
    // keeping it simple for now as per prompt "add comments... auto-edit on DB".

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError("Please select a rating")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await reviewsApi.createReview(
                {
                    entity_id: entityId,
                    entity_type: entityType,
                    rating,
                    title,
                    comment,
                    photos: [] // Placeholder
                },
                {
                    headers: { "x-user-id": user?.id || "" }
                }
            )
            onSuccess?.()
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Failed to submit review")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4">
            <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">How was your experience?</h3>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-zinc-300 dark:text-zinc-600"
                                    } transition-colors duration-200`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Title (Optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Your Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us more about what you liked or didn't like..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
