"use client"

import React from 'react'
import { MapPin, ArrowRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BeautyNearYou() {
    const router = useRouter()
    return (
        <section className="bg-white dark:bg-[#18181b] rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-7 h-7 text-[#FF5E1F]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1c140d] dark:text-white tracking-tight">Near You</h2>
                        <p className="text-base text-slate-500 font-medium">Top rated salons in your area</p>
                    </div>
                </div>

                <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-zinc-700 text-sm font-bold hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-all">
                    View on Map <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: 1, name: "Elite Salon", distance: "0.2 km", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&auto=format&fit=crop" },
                    { id: 2, name: "Pure Skin Clinic", distance: "0.5 km", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=200&auto=format&fit=crop" },
                    { id: 3, name: "The Hair Loft", distance: "0.8 km", image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=200&auto=format&fit=crop" }
                ].map((spot, i) => (
                    <div
                        key={i}
                        className="flex gap-5 p-4 rounded-[2rem] bg-slate-50 dark:bg-zinc-800/50 hover:bg-white hover:shadow-xl dark:hover:bg-zinc-800 transition-all cursor-pointer group border border-transparent hover:border-slate-100 dark:hover:border-zinc-700"
                        onClick={() => router.push(`/beauty/${spot.id}`)}
                    >
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-200 shrink-0 shadow-sm">
                            <img src={spot.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Salon" />
                        </div>
                        <div className="flex flex-col justify-center py-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-[#FF5E1F] transition-colors">{spot.name}</h4>
                            <p className="text-sm text-slate-500 mb-3 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {spot.distance} away
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full w-fit tracking-wide uppercase">Open Now</span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full md:hidden mt-8 flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-slate-200 dark:border-zinc-700 text-sm font-bold bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                View on Map <ArrowRight className="w-4 h-4" />
            </button>
        </section >
    )
}
