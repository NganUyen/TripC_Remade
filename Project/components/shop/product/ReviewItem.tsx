"use client"

import { Star, CheckCircle2 } from 'lucide-react'
import type { Review } from '@/lib/hooks/useShopAPI'

interface ReviewItemProps {
    review: Review
}

export function ReviewItem({ review }: ReviewItemProps) {
    return (
        <div className="py-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm">
                        {review.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {review.user_name || 'Verified Customer'}
                            {review.is_verified_purchase && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-[#FF5E1F] text-[#FF5E1F]' : 'fill-slate-200 text-slate-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString()}
                </span>
            </div>

            {review.title && (
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {review.title}
                </h4>
            )}

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {review.body}
            </p>

            {review.photos && review.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {review.photos.map((photo, i) => (
                        <div
                            key={i}
                            className="w-20 h-20 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                        >
                            <img
                                src={photo}
                                alt={`Review photo ${i + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
