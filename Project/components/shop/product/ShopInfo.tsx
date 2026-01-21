"use client"

import { MessageCircle, Store } from 'lucide-react'

export function ShopInfo() {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Shop Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Monos Official Store</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>98% Positive Feedback</span>
                        <span>•</span>
                        <span>30k Followers</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-12 text-center md:text-left">
                <div>
                    <span className="block text-slate-400 text-xs">Seller Ratings</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">99%</span>
                </div>
                <div>
                    <span className="block text-slate-400 text-xs">Ship on Time</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">100%</span>
                </div>
                <div>
                    <span className="block text-slate-400 text-xs">Chat Response</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">95%</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5">
                    <MessageCircle className="w-4 h-4" /> Chat
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/20">
                    <Store className="w-4 h-4" /> Visit Store
                </button>
            </div>
        </div>
    )
}
