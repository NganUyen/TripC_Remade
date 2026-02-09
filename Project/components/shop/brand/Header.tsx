"use client"

import { MessageCircle, Star, Users, Clock, ShieldCheck, Plus, ArrowLeft } from 'lucide-react'
import { Brand } from '@/lib/shop/types'
import Link from 'next/link'

interface BrandHeaderProps {
    brand: Brand
}

export function BrandHeader({ brand }: BrandHeaderProps) {
    const formatCount = (n?: number) => {
        if (!n) return '0';
        return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6 relative group">
            {/* Navigation Back */}
            <div className="absolute top-4 left-4 z-20">
                <Link
                    href="/shop"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md text-slate-700 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-all text-xs font-medium shadow-sm active:scale-95"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back</span>
                </Link>
            </div>

            {/* Banner Area - Reduced Height */}
            <div className="h-24 md:h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {brand.cover_url ? (
                    <img src={brand.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
            </div>

            <div className="px-4 md:px-6 pb-4">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-10 md:-mt-12 gap-4 relative z-10">
                    {/* Logo - Reduced Size */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-slate-900 p-1 shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                            <img
                                src={brand.logo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"}
                                alt={brand.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Info & Stats - Horizontal Layout */}
                    <div className="flex-1 text-center md:text-left w-full pt-1 md:pt-0">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-3 md:gap-6">
                            {/* Brand Name & Desc */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-1.5 mb-0.5">
                                    {brand.name}
                                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                </h1>
                                {brand.tagline ? (
                                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium line-clamp-1">{brand.tagline}</p>
                                ) : brand.description ? (
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">{brand.description}</p>
                                ) : null}
                            </div>

                            {/* Actions & Compact Stats */}
                            <div className="flex flex-col md:items-end gap-2 md:pb-1">
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                                    </button>
                                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm">
                                        <Plus className="w-3.5 h-3.5" /> Follow
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 last:border-0 px-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium text-[10px]">Rating</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Star className="w-3 h-3 text-orange-400" />
                            {brand.rating_avg?.toFixed(1) || 'New'}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 last:border-0 px-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium text-[10px]">Followers</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatCount(brand.follower_count)}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 last:border-0 px-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium text-[10px]">Ship Time</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {brand.on_time_ship_rate ? `${brand.on_time_ship_rate}%` : '—'}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center px-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium text-[10px]">Response</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {brand.response_rate ? `${brand.response_rate}%` : '—'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
