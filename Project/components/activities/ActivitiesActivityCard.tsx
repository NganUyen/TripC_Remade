'use client'

import React from 'react'

interface ActivityCardProps {
    image: string
    title: string
    rating: string
    reviews: string
    originalPrice: string
    price: string
    discount?: string
    badges?: { text: string, colorClass: string }[]
    onShare: () => void
    themeColor?: 'primary' | 'green'
}

export function ActivitiesActivityCard({ image, title, rating, reviews, originalPrice, price, discount, badges, onShare, themeColor = 'primary' }: ActivityCardProps) {
    const [isFavorite, setIsFavorite] = React.useState(false)
    const isGreen = themeColor === 'green'

    const priceColor = isGreen ? "text-green-600" : "text-primary"
    const buttonClass = isGreen
        ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
        : "bg-primary hover:bg-primary-dark shadow-primary/20"
    const hoverTitle = isGreen ? "group-hover:text-green-600" : "group-hover:text-primary"

    return (
        <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-[20px] overflow-hidden shadow-card hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:-translate-y-1 relative">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <div
                    className="bg-cover bg-center w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url('${image}')` }}
                ></div>
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button
                        className="glass-btn size-9 rounded-full flex items-center justify-center text-white/90 hover:text-blue-500 transition-colors"
                        onClick={(e) => { e.preventDefault(); onShare(); }}
                    >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <button
                        className={`glass-btn size-9 rounded-full flex items-center justify-center text-white/90 hover:text-red-500 transition-colors ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
                        style={isFavorite ? { animation: 'heart-burst 0.3s ease-in-out' } : {}}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'text-red-500' : ''}`} style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                    </button>
                </div>
            </div>
            <div className="flex flex-col flex-1 p-5 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-wide">Instant Confirmation</span>
                    {badges?.map((badge, i) => (
                        <span key={i} className={`${badge.colorClass} text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide`}>{badge.text}</span>
                    ))}
                </div>
                <h3 className={`text-lg font-bold text-slate-800 dark:text-white leading-tight line-clamp-2 ${hoverTitle} transition-colors`}>{title}</h3>
                <div className="flex items-center mt-1">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                        <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                        <span>{rating}</span>
                    </div>
                    <span className="text-slate-400 font-normal text-xs ml-1">({reviews} reviews)</span>
                </div>
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50 dark:border-slate-700">
                    <div className="flex flex-col">
                        {(originalPrice && discount) && (
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs text-slate-400 line-through font-medium">${originalPrice}</span>
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-1.5 py-0.5 rounded">{discount}</span>
                            </div>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">From</span>
                            <span className={`text-xl font-bold ${priceColor}`}>${price}</span>
                        </div>
                    </div>
                    <button className={`${buttonClass} text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg hover:shadow-glow-hover transform active:scale-95`}>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}
