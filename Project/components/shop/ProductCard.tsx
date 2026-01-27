"use client"

import React from 'react'
import Link from 'next/link'
import { Star, ShoppingBag, Heart } from 'lucide-react'

export interface ProductCardProps {
    id: string | number
    slug?: string  // Add slug for SEO-friendly URLs
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

import { useCartStore } from '@/store/useCartStore';
import { useCartAnimation } from '@/store/useCartAnimation';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';

export function ProductCard({ id, slug, title, price, rating, reviews, image, badge, compareAtPrice, category = "Travel Gear", colors = ["#000000", "#1e293b", "#cbd5e1"] }: ProductCardProps) {
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0
    // Use slug if available, fallback to id
    const productUrl = slug ? `/shop/product/${slug}` : `/shop/product/${id}`

    // Hooks
    const { addItem } = useCartStore();
    const { startAnimation } = useCartAnimation();
    const { userId } = useAuth();
    const [isAdding, setIsAdding] = React.useState(false);

    const handleQuickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error("Please login to add items");
            return;
        }

        if (isAdding) return;
        setIsAdding(true);


        try {
            // Fetch variants using slug if possible, else ID (but ID route is removed now, so only slug)
            // Wait, if we removed [id] route, we MUST use slug.
            // ProductCard has slug prop.
            const identifier = slug || id;
            const res = await fetch(`/api/shop/products/${identifier}/variants`);
            if (!res.ok) throw new Error('Failed to fetch variants');

            const json = await res.json();
            const variants = json.data;

            if (!variants || variants.length === 0) {
                toast.error('Product unavailable');
                return;
            }

            // Pick first active variant
            const variant = variants.find((v: any) => v.is_active) || variants[0];

            if (!variant) {
                toast.error('Out of stock');
                return;
            }

            // Animation
            const imgEl = (e.currentTarget.closest('.group')?.querySelector('img') as HTMLImageElement);
            if (imgEl) {
                // Pass the element directly, store handles the rect/ref
                startAnimation(imgEl, image);
            }

            // Add to Cart
            await addItem(variant.id, 1);

        } catch (err) {
            console.error(err);
            toast.error('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Link
            href={productUrl}
            prefetch={true}
            className="group relative flex flex-col gap-3 rounded-2xl cursor-pointer"
        >
            {/* Image Container - Square Aspect Ratio */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-zinc-800 shadow-sm">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    {badge && (
                        <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wide">
                            {badge}
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="ml-auto bg-[#FF5E1F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                            -{discount}%
                        </div>
                    )}
                </div>

                {/* Hover Overlay & Quick Add Button Slide Up */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button
                        className="cursor-pointer bg-white text-slate-900 hover:bg-[#FF5E1F] hover:text-white px-6 py-2 rounded-full font-bold shadow-xl translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-wait"
                        onClick={handleQuickAdd}
                        disabled={isAdding}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isAdding ? 'Adding...' : 'Quick Add'}
                    </button>
                </div>
            </div>

            {/* Content Details */}
            <div className="px-1 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 mb-1 group-hover:text-[#FF5E1F] transition-colors">
                    {title}
                </h3>

                {/* Rating & Category */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rating}</span>
                        <span className="text-xs text-slate-400">({reviews})</span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{category}</span>
                </div>

                {/* Price & Swatches */}
                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        {compareAtPrice && (
                            <span className="text-[10px] text-slate-400 line-through font-medium mb-0.5">${compareAtPrice}</span>
                        )}
                        <span className="text-xl font-black text-[#FF5E1F]">${price}</span>
                    </div>

                    {/* Color Swatches (Mini) */}
                    <div className="flex -space-x-1.5 pb-1">
                        {colors.slice(0, 3).map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                        {colors.length > 3 && (
                            <div className="w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                +{colors.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
