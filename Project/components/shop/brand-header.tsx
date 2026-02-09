"use client"

import { MessageCircle, Star, Users, Clock, ShieldCheck, Plus } from 'lucide-react'
import { Brand } from '@/lib/shop/types'

interface BrandHeaderProps {
    brand: Brand
}

export function BrandHeader({ brand }: BrandHeaderProps) {
    const formatCount = (n?: number) => {
        if (!n) return '0';
        return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            {/* Banner Area (Gradient since we don't have banner_url yet) */}
            <div className="h-32 bg-gradient-to-r from-[#FF5E1F] to-[#FF8A00] relative">
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1 shadow-lg z-10">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900">
                            <img
                                src={brand.logo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"}
                                alt={brand.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {brand.name}
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </h1>
                                {brand.tagline && (
                                    <p className="text-slate-500 text-sm mt-1">{brand.tagline}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <MessageCircle className="w-4 h-4" /> Chat
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5E1F] text-white font-bold text-sm hover:bg-[#E04F16] transition-colors shadow-lg shadow-orange-500/20">
                                    <Plus className="w-4 h-4" /> Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF5E1F]">
                            <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-slate-900 dark:text-white">{brand.rating_avg?.toFixed(1) || 'NEW'}</span>
                            <span className="text-xs text-slate-500">Rating</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-slate-900 dark:text-white">{formatCount(brand.follower_count)}</span>
                            <span className="text-xs text-slate-500">Followers</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-slate-900 dark:text-white">{brand.on_time_ship_rate ? `${brand.on_time_ship_rate}%` : '—'}</span>
                            <span className="text-xs text-slate-500">Ship on Time</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-slate-900 dark:text-white">{brand.response_rate ? `${brand.response_rate}%` : '—'}</span>
                            <span className="text-xs text-slate-500">Chat Response</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
