'use client'

interface ActivityFiltersProps {
    themeColor?: 'primary' | 'green'
}

export function ActivitiesFilters({ themeColor = 'primary' }: ActivityFiltersProps) {
    const isGreen = themeColor === 'green'
    const activeButtonClass = isGreen
        ? "bg-green-600 border-green-600 text-white shadow-glow shadow-green-500/30"
        : "bg-primary border-primary text-white shadow-glow"

    const iconColor = isGreen ? "text-green-600" : "text-primary"

    return (
        <section className="w-full bg-background-light dark:bg-slate-900 relative z-30 pt-8 pb-12">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        <button className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white shadow-glow border border-primary transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px]">star</span>
                            <span className="font-bold text-sm">All</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-violet-600 hover:border-violet-600 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">attractions</span>
                            <span className="font-semibold text-sm">Theme Parks</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-cyan-500 hover:border-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">water_drop</span>
                            <span className="font-semibold text-sm">Water Parks</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-amber-500 hover:border-amber-500 hover:text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">museum</span>
                            <span className="font-semibold text-sm">Museums</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">forest</span>
                            <span className="font-semibold text-sm">Nature</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">map</span>
                            <span className="font-semibold text-sm">Tours</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-rose-500 hover:border-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">restaurant</span>
                            <span className="font-semibold text-sm">Food</span>
                        </button>
                        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:bg-purple-500 hover:border-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[18px] group-hover:text-white transition-colors">palette</span>
                            <span className="font-semibold text-sm">Workshops</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
