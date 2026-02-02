import { Star, ThumbsUp, MoreHorizontal, BadgeCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Review } from "@/lib/reviews/types"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"

interface ReviewItemProps {
    review: Review
    onHelpful?: (reviewId: string) => void
    onReport?: (reviewId: string) => void
}

export function ReviewItem({ review, onHelpful, onReport }: ReviewItemProps) {
    const { user } = useUser()
    const [isHelpfulClicked, setIsHelpfulClicked] = useState(false)

    const handleHelpfulClick = () => {
        if (isHelpfulClicked) return
        setIsHelpfulClicked(true)
        onHelpful?.(review.id)
    }

    return (
        <article className="py-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                        {review.user?.avatar_url ? (
                            <img src={review.user.avatar_url} alt={review.user.full_name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-zinc-500 font-bold text-sm">
                                {(review.user?.first_name?.[0] || "U").toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                                {review.user?.full_name || "Anonymous User"}
                            </h4>
                            {review.is_verified && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    <BadgeCheck className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {onReport && (
                    <button
                        onClick={() => onReport(review.id)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1 mb-3 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "text-zinc-200 dark:text-zinc-700"}`}
                    />
                ))}
            </div>

            {review.title && (
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2">
                    {review.title}
                </h3>
            )}

            <div className="prose prose-sm dark:prose-invert text-zinc-600 dark:text-zinc-300 mb-4 max-w-none">
                <p>{review.comment}</p>
            </div>

            {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.photos.map((photo, index) => (
                        <div key={index} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-zinc-800">
                            <img src={photo} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-4">
                <button
                    onClick={handleHelpfulClick}
                    disabled={isHelpfulClicked}
                    className={`flex items-center gap-2 text-xs font-medium transition-colors ${isHelpfulClicked
                            ? "text-primary"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                >
                    <ThumbsUp className={`w-4 h-4 ${isHelpfulClicked ? "fill-current" : ""}`} />
                    Helpful ({review.helpful_count + (isHelpfulClicked ? 1 : 0)})
                </button>
            </div>
        </article>
    )
}
