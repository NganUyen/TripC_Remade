import Link from 'next/link'

const categories = [
    { icon: 'home', label: 'Home', active: true, color: 'text-orange-600', bg: 'bg-orange-50', darkColor: 'dark:text-orange-400', darkBg: 'dark:bg-orange-500/10' },
    { icon: 'flight', label: 'Flights', color: 'group-hover:text-sky-600', hoverBg: 'hover:bg-sky-50', darkColor: 'dark:group-hover:text-sky-400', darkHoverBg: 'dark:hover:bg-sky-500/10' },
    { icon: 'hotel', label: 'Hotels', color: 'group-hover:text-blue-600', hoverBg: 'hover:bg-blue-50', darkColor: 'dark:group-hover:text-blue-400', darkHoverBg: 'dark:hover:bg-blue-500/10' },
    { icon: 'confirmation_number', label: 'Vouchers', color: 'group-hover:text-pink-600', hoverBg: 'hover:bg-pink-50', darkColor: 'dark:group-hover:text-pink-400', darkHoverBg: 'dark:hover:bg-pink-500/10' },
    { icon: 'calendar_month', label: 'Events', color: 'group-hover:text-indigo-600', hoverBg: 'hover:bg-indigo-50', darkColor: 'dark:group-hover:text-indigo-400', darkHoverBg: 'dark:hover:bg-indigo-500/10' },
    { icon: 'restaurant', label: 'Dining', color: 'group-hover:text-red-600', hoverBg: 'hover:bg-red-50', darkColor: 'dark:group-hover:text-red-400', darkHoverBg: 'dark:hover:bg-red-500/10' },
    { icon: 'hiking', label: 'Activities', color: 'group-hover:text-green-600', hoverBg: 'hover:bg-green-50', darkColor: 'dark:group-hover:text-green-400', darkHoverBg: 'dark:hover:bg-green-500/10' },
    { icon: 'spa', label: 'Wellness', color: 'group-hover:text-teal-600', hoverBg: 'hover:bg-teal-50', darkColor: 'dark:group-hover:text-teal-400', darkHoverBg: 'dark:hover:bg-teal-500/10' },
    { icon: 'face_3', label: 'Beauty', color: 'group-hover:text-rose-600', hoverBg: 'hover:bg-rose-50', darkColor: 'dark:group-hover:text-rose-400', darkHoverBg: 'dark:hover:bg-rose-500/10' },
    { icon: 'music_note', label: 'Entmt.', color: 'group-hover:text-purple-600', hoverBg: 'hover:bg-purple-50', darkColor: 'dark:group-hover:text-purple-400', darkHoverBg: 'dark:hover:bg-purple-500/10' },
    { icon: 'shopping_bag', label: 'Shop', color: 'group-hover:text-amber-600', hoverBg: 'hover:bg-amber-50', darkColor: 'dark:group-hover:text-amber-400', darkHoverBg: 'dark:hover:bg-amber-500/10' },
    { icon: 'commute', label: 'Transport', color: 'group-hover:text-cyan-600', hoverBg: 'hover:bg-cyan-50', darkColor: 'dark:group-hover:text-cyan-400', darkHoverBg: 'dark:hover:bg-cyan-500/10' },
]

export function CategorySlider() {
    return (
        <div className="sticky top-16 sm:top-20 z-50 w-full glass-panel transition-all duration-300 shadow-sm">
            <div className="max-w-[1440px] mx-auto relative group/slider">
                <button aria-label="Scroll left" className="absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 z-20 size-8 bg-white/90 dark:bg-slate-700/90 backdrop-blur rounded-full shadow-lg border border-slate-100 dark:border-slate-600 items-center justify-center text-slate-600 dark:text-white opacity-0 group-hover/slider:opacity-100 transition-all duration-200 hidden md:flex hover:scale-110 active:scale-95 cursor-pointer">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button aria-label="Scroll right" className="absolute right-2 lg:right-0 top-1/2 -translate-y-1/2 z-20 size-8 bg-white/90 dark:bg-slate-700/90 backdrop-blur rounded-full shadow-lg border border-slate-100 dark:border-slate-600 items-center justify-center text-slate-600 dark:text-white opacity-0 group-hover/slider:opacity-100 transition-all duration-200 hidden md:flex hover:scale-110 active:scale-95 cursor-pointer">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
                <div className="relative overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 min-w-max mx-auto justify-start lg:justify-center">
                        {categories.map((cat, i) => {
                            if (cat.active) {
                                return (
                                    <Link key={i} href="#" className={`active group flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 ${cat.bg} ${cat.darkBg}`}>
                                        <span className={`material-symbols-outlined mb-1 text-[26px] ${cat.color} ${cat.darkColor}`}>{cat.icon}</span>
                                        <span className={`text-[11px] font-bold tracking-wide text-orange-700 dark:text-orange-300`}>{cat.label}</span>
                                    </Link>
                                )
                            }
                            return (
                                <Link key={i} href="#" className={`group flex flex-col items-center justify-center min-w-[70px] px-2 py-2 rounded-xl transition-all duration-300 bg-transparent ${cat.hoverBg} ${cat.darkHoverBg}`}>
                                    <span className={`material-symbols-outlined text-slate-500 dark:text-slate-400 mb-1 text-[26px] transition-colors ${cat.color} ${cat.darkColor}`}>{cat.icon}</span>
                                    <span className={`text-slate-600 dark:text-slate-400 text-[11px] font-semibold tracking-wide transition-colors ${cat.color?.replace('text-', 'text-sl-').replace('group-hover:', 'group-hover:text-')} ${cat.darkColor?.replace('dark:text-', 'dark:text-sl-').replace('dark:group-hover:', 'dark:group-hover:text-')}`.replace(/text-(sky|blue|pink|indigo|red|green|teal|rose|purple|amber|cyan)-600/g, 'text-$1-700').replace(/text-(sky|blue|pink|indigo|red|green|teal|rose|purple|amber|cyan)-400/g, 'text-$1-300')}>{cat.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
