"use client"

import React from 'react'
import Link from 'next/link'
import { Star, ShoppingBag, Heart } from 'lucide-react'

export interface ProductCardProps {
    id: string | number
    title: string
    price: number
    rating: number
    reviews: number
    image: string
    badge?: string
    compareAtPrice?: number
    category?: string
    colors?: string[]
}

export function ProductCard({ id, title, price, rating, reviews, image, badge, compareAtPrice, category = "Travel Gear", colors = ["#000000", "#1e293b", "#cbd5e1"] }: ProductCardProps) {
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0

    return (
        <Link
            href={`/shop/product/${id}`}
            prefetch={true}
            className="group relative block h-full bg-white dark:bg-slate-900 rounded-3xl p-3 transition-all duration-500 ease-out ring-1 ring-slate-100 dark:ring-slate-800 hover:ring-2 hover:ring-primary/10 dark:hover:ring-primary/20 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="flex flex-col h-full">
                {/* Image Container */}
                <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-slate-50 dark:bg-zinc-800 mb-3 will-change-transform">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                    />

                    {/* Premium Shine/Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badge (Top Left) */}
                    {badge && (
                        <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                            {badge}
                        </div>
                    )}

                    {/* Discount Badge (Top Right) */}
                    {discount > 0 && (
                        <div className="absolute top-3 right-3 z-20 bg-[#FF5E1F] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                            -{discount}%
                        </div>
                    )}

                    {/* Quick Add Button */}
                    <button
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out text-xs font-bold hover:bg-[#FF5E1F] hover:text-white dark:hover:bg-[#FF5E1F]"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Quick Add
                    </button>
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-2 px-1 flex-grow">
                    {/* Meta Row: Category & Rating */}
                    <div className="flex items-start justify-between">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide group-hover:bg-[#FF5E1F]/5 group-hover:text-[#FF5E1F] transition-colors">
                            {category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{rating}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-[#FF5E1F] transition-colors">
                        {title}
                    </h4>

                    {/* Price & Swatches Row */}
                    <div className="mt-auto pt-1 flex items-end justify-between">
                        <div className="flex flex-col leading-none">
                            {compareAtPrice && (
                                <span className="text-slate-400 text-xs line-through font-medium mb-1">
                                    ${compareAtPrice}
                                </span>
                            )}
                            <span className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-[#FF5E1F] transition-colors">
                                ${price}
                            </span>
                        </div>

                        {/* Color Swatches */}
                        <div className="flex -space-x-2 pb-1">
                            {colors.slice(0, 3).map((color, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm" style={{ backgroundColor: color }} />
                            ))}
                            {colors.length > 3 && (
                                <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500 ring-1 ring-slate-100 dark:ring-slate-800">
                                    +{colors.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
