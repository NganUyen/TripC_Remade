'use client'

import React from 'react'

interface WellnessActivityCardProps {
    image: string
    title: string
    location: string
    rating: string
    reviews: string
    price: string
    originalPrice?: string
    discount?: string
    priceLabel?: string
    starCount?: string // Used for duration in this context
    badges?: { text: string, colorClass: string, icon?: string }[]
}

export function WellnessActivityCard({
    image,
    title,
    location,
    rating,
    reviews,
    price,
    originalPrice,
    discount,
    priceLabel = "Per Person",
    starCount,
    badges
}: WellnessActivityCardProps) {
    const [isFavorite, setIsFavorite] = React.useState(false)

    return (
        <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-[20px] overflow-hidden shadow-card hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:-translate-y-1 h-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <div
                    className="bg-cover bg-center w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url('${image}')` }}
                ></div>
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button
                        className={`glass-btn size-9 rounded-full flex items-center justify-center text-white/90 hover:text-red-500 transition-colors bg-black/20 backdrop-blur-sm ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'text-red-500 fill-current' : ''}`}>favorite</span>
                    </button>
                </div>

                {badges && badges.length > 0 && (
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                        {badges.map((badge, i) => (
                            <span key={i} className={`${badge.colorClass} text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm`}>
                                {badge.icon && <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>}
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1 group-hover:text-earth-olive transition-colors">{title}</h3>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span>{location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center mt-auto pt-2">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                        <span>{rating}</span>
                        <span className="text-slate-400 font-normal text-xs ml-0.5">({reviews})</span>
                    </div>

                    {starCount && (
                        <div className="flex items-center gap-1 text-slate-500 ml-3 text-sm">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span>{starCount}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex flex-col">
                        {(originalPrice || discount) && (
                            <div className="flex items-center gap-2 mb-0.5">
                                {originalPrice && <span className="text-xs text-slate-400 line-through font-medium">${originalPrice}</span>}
                                {discount && <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-1.5 py-0.5 rounded">{discount}</span>}
                            </div>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">From</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">${price}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{priceLabel}</span>
                    </div>
                    <button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-earth-olive hover:border-earth-olive hover:text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-sm hover:shadow-lg transform active:scale-95 flex items-center gap-1">
                        <span>Details</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
