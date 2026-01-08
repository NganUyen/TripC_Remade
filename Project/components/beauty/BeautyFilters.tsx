'use client'

export function BeautyFilters() {
    const filters = [
        { name: "Spas", icon: "spa", active: true },
        { name: "Salons", icon: "content_cut" },
        { name: "Massage", icon: "self_improvement" },
        { name: "Hair & Nails", icon: "palette" },
        { name: "Facials", icon: "face" },
        { name: "Makeup", icon: "brush" },
    ]

    return (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 overflow-x-auto hide-scrollbar py-2">
            {filters.map((filter) => (
                <button
                    key={filter.name}
                    className={`group flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${filter.active
                            ? "bg-rose-gold text-white shadow-glow-rose border border-rose-gold/20 transform hover:-translate-y-0.5"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-rose-gold shadow-sm border border-slate-200 dark:border-slate-800"
                        }`}
                >
                    <span
                        className={`material-symbols-outlined text-[20px] ${filter.active ? 'font-variation-settings-\'FILL\'1' : ''}`}
                    >
                        {filter.icon}
                    </span>
                    <span className="font-bold text-sm tracking-wide">{filter.name}</span>
                </button>
            ))}
        </div>
    )
}
