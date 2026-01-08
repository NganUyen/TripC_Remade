'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
    { icon: 'home', label: 'Home', href: '/', color: 'text-orange-600', hoverBg: 'hover:bg-orange-50', activeBg: 'bg-orange-100 dark:bg-orange-500/20', activeTextColor: 'text-orange-700 dark:text-orange-400' },
    { icon: 'flight', label: 'Flights', href: '#', color: 'text-sky-600', hoverBg: 'hover:bg-sky-50', activeBg: 'bg-sky-100', activeTextColor: 'text-sky-700' },
    { icon: 'hotel', label: 'Hotels', href: '#', color: 'text-blue-600', hoverBg: 'hover:bg-blue-50', activeBg: 'bg-blue-100', activeTextColor: 'text-blue-700' },
    { icon: 'confirmation_number', label: 'Vouchers', href: '#', color: 'text-pink-600', hoverBg: 'hover:bg-pink-50', activeBg: 'bg-pink-100', activeTextColor: 'text-pink-700' },
    { icon: 'calendar_month', label: 'Events', href: '#', color: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50', activeBg: 'bg-indigo-100', activeTextColor: 'text-indigo-700' },
    { icon: 'restaurant', label: 'Dining', href: '#', color: 'text-red-600', hoverBg: 'hover:bg-red-50', activeBg: 'bg-red-100', activeTextColor: 'text-red-700' },
    { icon: 'hiking', label: 'Activities', href: '/activities', color: 'text-green-600', hoverBg: 'hover:bg-green-50', activeBg: 'bg-green-100 dark:bg-green-500/20', activeTextColor: 'text-green-700 dark:text-green-400' },
    { icon: 'spa', label: 'Wellness', href: '/wellness', color: 'text-teal-600', hoverBg: 'hover:bg-teal-50', activeBg: 'bg-teal-100', activeTextColor: 'text-teal-700' },
    { icon: 'face_3', label: 'Beauty', href: '#', color: 'text-rose-600', hoverBg: 'hover:bg-rose-50', activeBg: 'bg-rose-100', activeTextColor: 'text-rose-700' },
    { icon: 'music_note', label: 'Entmt.', href: '#', color: 'text-purple-600', hoverBg: 'hover:bg-purple-50', activeBg: 'bg-purple-100', activeTextColor: 'text-purple-700' },
    { icon: 'shopping_bag', label: 'Shop', href: '#', color: 'text-amber-600', hoverBg: 'hover:bg-amber-50', activeBg: 'bg-amber-100', activeTextColor: 'text-amber-700' },
    { icon: 'commute', label: 'Transport', href: '#', color: 'text-cyan-600', hoverBg: 'hover:bg-cyan-50', activeBg: 'bg-cyan-100', activeTextColor: 'text-cyan-700' },
]

export function CategorySlider() {
    const pathname = usePathname()

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
                            const isActive = pathname === cat.href

                            if (isActive) {
                                return (
                                    <Link key={i} href={cat.href} className={`active group flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${cat.activeBg}`}>
                                        <span className={`material-symbols-outlined mb-1 text-[28px] ${cat.activeTextColor} transition-colors`}>{cat.icon}</span>
                                        <span className={`text-[12px] font-bold tracking-wide ${cat.activeTextColor} transition-colors`}>{cat.label}</span>
                                    </Link>
                                )
                            }
                            return (
                                <Link key={i} href={cat.href} className={`group flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all duration-300 bg-transparent ${cat.hoverBg}`}>
                                    <span className={`material-symbols-outlined text-slate-500 dark:text-slate-400 mb-1 text-[28px] transition-colors group-hover:${cat.color}`}>{cat.icon}</span>
                                    <span className={`text-slate-600 dark:text-slate-400 text-[12px] font-medium tracking-wide transition-colors group-hover:${cat.color}`}>{cat.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
