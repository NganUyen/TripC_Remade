export function FilterSidebar() {
    return (
        <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Filters</h3>
                    <button className="text-sm text-primary font-medium hover:underline">Reset</button>
                </div>

                {/* Price Range */}
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">Price Range</h4>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <span>$0</span>
                        <span>$500+</span>
                    </div>
                    <input className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
                </div>

                {/* Categories */}
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">Categories</h4>
                    <div className="space-y-3">
                        {[
                            { label: "Attractions", count: 120, checked: true },
                            { label: "Tours", count: 45 },
                            { label: "Nightlife", count: 23 }
                        ].map((cat) => (
                            <label key={cat.label} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    defaultChecked={cat.checked}
                                    className="form-checkbox rounded text-primary border-slate-300 focus:ring-primary h-5 w-5 bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
                                />
                                <span className="text-slate-600 dark:text-slate-300 text-sm group-hover:text-primary transition-colors">
                                    {cat.label} ({cat.count})
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">Rating</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg -mx-2">
                            <input type="radio" name="rating" className="form-radio text-primary focus:ring-primary bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
                            <div className="flex text-yellow-400 text-sm">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="material-symbols-outlined text-base header-icon icon-filled">star</span>
                                ))}
                            </div>
                            <span className="text-xs text-slate-500">4.5 & up</span>
                        </label>
                    </div>
                </div>
            </div>
        </aside>
    )
}
