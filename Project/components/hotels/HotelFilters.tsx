"use client"

import { Star, Check } from 'lucide-react'

export function HotelFilters() {
    return (
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-8 sticky top-24">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                    <button className="text-sm font-semibold text-orange-500 hover:text-orange-600">Reset</button>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Price Range</h4>
                    <div className="px-1">
                        <input
                            type="range"
                            min="50"
                            max="1000"
                            className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex items-center justify-between mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <span>$50</span>
                            <span>$1,000+</span>
                        </div>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Star Rating</h4>
                    <div className="flex flex-col gap-3">
                        {[5, 4, 3].map((stars) => (
                            <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                    <input type="checkbox" className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" />
                                    <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:bg-orange-500 absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 scale-0 peer-checked:scale-100" />
                                    <div className="w-full h-full rounded-[5px] absolute inset-0 bg-transparent peer-checked:bg-orange-500 transition-colors" />
                                    {/* Note: Custom Checkbox Implementation Logic */}
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        />
                                    ))}
                                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">{stars} Stars</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Popular Filters */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Amenities</h4>
                    <div className="flex flex-col gap-3">
                        {["Free Breakfast", "Swimming Pool", "Spa & Wellness", "Free Cancellation", "Pay at Hotel"].map((item) => (
                            <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                    <input type="checkbox" className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" />
                                    <div className="w-full h-full rounded-[5px] bg-transparent peer-checked:bg-orange-500 transition-colors flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

            </div>
        </aside>
    )
}
