'use client'

export function WellnessFilters() {
    const categories = [
        { name: "All", icon: "grid_view", active: true },
        { name: "Yoga", icon: "self_improvement" },
        { name: "Meditation", icon: "mindfulness" },
        { name: "Spa & Detox", icon: "spa" },
        { name: "Retreats", icon: "cottage" },
        { name: "Fitness", icon: "fitness_center" },
        { name: "Nutrition", icon: "restaurant" },
    ]

    return (
        <section className="w-full bg-background-light dark:bg-slate-900 relative z-30 py-8 border-b border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                className={`group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${category.active
                                        ? "bg-earth-olive text-white shadow-lg shadow-earth-olive/20"
                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:border-earth-olive hover:text-earth-olive"
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${category.active ? "text-white" : "text-slate-400 group-hover:text-earth-olive"}`}>
                                    {category.icon}
                                </span>
                                <span className="font-semibold text-sm">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
