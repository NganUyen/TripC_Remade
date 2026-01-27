"use client"

import { Image as ImageIcon } from 'lucide-react'

interface ReviewFiltersProps {
    currentRating?: number
    hasPhotos: boolean
    counts: { [key: number]: number }
    totalCount: number
    onRatingChange: (rating?: number) => void
    onHasPhotosChange: (hasPhotos: boolean) => void
}

export function ReviewFilters({
    currentRating,
    hasPhotos,
    counts,
    totalCount,
    onRatingChange,
    onHasPhotosChange
}: ReviewFiltersProps) {

    return (
        <div className="flex flex-wrap gap-2 py-4">
            <button
                onClick={() => onRatingChange(undefined)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!currentRating && !hasPhotos
                    ? 'bg-[#FF5E1F] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
            >
                All ({totalCount})
            </button>

            {[5, 4, 3, 2, 1].map((star) => (
                <button
                    key={star}
                    onClick={() => {
                        onRatingChange(star)
                        onHasPhotosChange(false)
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${currentRating === star
                        ? 'bg-[#FF5E1F] text-white shadow-md shadow-orange-500/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                >
                    {star} Star ({counts[star] || 0})
                </button>
            ))}

            <button
                onClick={() => {
                    onHasPhotosChange(!hasPhotos)
                    onRatingChange(undefined)
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${hasPhotos
                    ? 'bg-[#FF5E1F] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
            >
                <ImageIcon className="w-3.5 h-3.5" />
                With Photos
            </button>
        </div>
    )
}
