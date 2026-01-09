export function QuickFilters() {
    const filters = [
        { icon: "local_activity", label: "Attractions", active: true },
        { icon: "pool", label: "Water Parks" },
        { icon: "museum", label: "Museums" },
        { icon: "pets", label: "Zoos & Aquariums" },
        { icon: "attractions", label: "Theme Parks" },
        { icon: "tram", label: "Cable Cars" },
        { icon: "hiking", label: "Outdoor Activities" },
    ]

    return (
        <div className="flex justify-center">
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar mask-gradient px-4">
                {filters.map((filter) => (
                    <button
                        key={filter.label}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-md whitespace-nowrap transition-all hover:-translate-y-1 group ${filter.active
                            ? "bg-white dark:bg-slate-800 text-primary ring-2 ring-primary"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
                            }`}
                    >
                        <span className={`material-symbols-outlined text-xl ${!filter.active && "group-hover:scale-110 transition-transform"}`}>
                            {filter.icon}
                        </span>
                        <span className={`font-${filter.active ? 'bold' : 'medium'}`}>
                            {filter.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
