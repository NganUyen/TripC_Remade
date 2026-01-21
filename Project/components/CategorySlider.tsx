"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
    { icon: 'home', label: 'Home', href: '/', color: 'text-orange-600', bg: 'bg-orange-50', darkColor: 'dark:text-orange-400', darkBg: 'dark:bg-orange-500/10' },
    { icon: 'flight', label: 'Flights', href: '/flights', color: 'group-hover:text-sky-600', hoverBg: 'hover:bg-sky-50', darkColor: 'dark:group-hover:text-sky-400', darkHoverBg: 'dark:hover:bg-sky-500/10' },
    { icon: 'hotel', label: 'Hotels', href: '/hotels', color: 'group-hover:text-blue-600', hoverBg: 'hover:bg-blue-50', darkColor: 'dark:group-hover:text-blue-400', darkHoverBg: 'dark:hover:bg-blue-500/10' },
    { icon: 'confirmation_number', label: 'Vouchers', href: '/vouchers', color: 'group-hover:text-pink-600', hoverBg: 'hover:bg-pink-50', darkColor: 'dark:group-hover:text-pink-400', darkHoverBg: 'dark:hover:bg-pink-500/10' },
    { icon: 'event', label: 'Events', href: '/events', color: 'group-hover:text-indigo-600', hoverBg: 'hover:bg-indigo-50', darkColor: 'dark:group-hover:text-indigo-400', darkHoverBg: 'dark:hover:bg-indigo-500/10' },
    { icon: 'restaurant', label: 'Dining', href: '/dining', color: 'group-hover:text-red-600', hoverBg: 'hover:bg-red-50', darkColor: 'dark:group-hover:text-red-400', darkHoverBg: 'dark:hover:bg-red-500/10' },
    { icon: 'hiking', label: 'Activities', href: '/activities', color: 'group-hover:text-green-600', hoverBg: 'hover:bg-green-50', darkColor: 'dark:group-hover:text-green-400', darkHoverBg: 'dark:hover:bg-green-500/10' },
    { icon: 'spa', label: 'Wellness', href: '/wellness', color: 'group-hover:text-teal-600', hoverBg: 'hover:bg-teal-50', darkColor: 'dark:group-hover:text-teal-400', darkHoverBg: 'dark:hover:bg-teal-500/10' },
    { icon: 'face_3', label: 'Beauty', href: '/beauty', color: 'group-hover:text-rose-600', hoverBg: 'hover:bg-rose-50', darkColor: 'dark:group-hover:text-rose-400', darkHoverBg: 'dark:hover:bg-rose-500/10' },
    { icon: 'music_note', label: 'Entmt.', href: '/entertainment', color: 'group-hover:text-purple-600', hoverBg: 'hover:bg-purple-50', darkColor: 'dark:group-hover:text-purple-400', darkHoverBg: 'dark:hover:bg-purple-500/10' },
    { icon: 'shopping_bag', label: 'Shop', href: '/shop', color: 'group-hover:text-amber-600', hoverBg: 'hover:bg-amber-50', darkColor: 'dark:group-hover:text-amber-400', darkHoverBg: 'dark:hover:bg-amber-500/10' },
    { icon: 'commute', label: 'Transport', href: '/transport', color: 'group-hover:text-cyan-600', hoverBg: 'hover:bg-cyan-50', darkColor: 'dark:group-hover:text-cyan-400', darkHoverBg: 'dark:hover:bg-cyan-500/10' },
]

export function CategorySlider() {
    const pathname = usePathname()

    // Assuming "detail" pages are anything deeper than the first segment (e.g. /events/123)
    // We allow root "/" and any top-level path "/events"
    const isDiscoverPage = pathname === "/" || /^\/[^/]+$/.test(pathname)

    if (!isDiscoverPage) return null

    return (
        <div className="sticky top-16 sm:top-20 z-50 w-full glass-panel transition-all duration-300 shadow-sm">
            <div className="max-w-[1440px] mx-auto relative group/slider">
                <div className="relative overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 min-w-max mx-auto justify-start lg:justify-center">
                        {categories.map((cat, i) => {
                            const isActive = pathname === cat.href
                            // Dynamic Active State Styles
                            const activeBg = cat.bg || cat.hoverBg?.replace('hover:', '')
                            const activeDarkBg = cat.darkBg || cat.darkHoverBg?.replace('dark:hover:', 'dark:')

                            // Icons: Remove 'group-hover:' to apply color directly
                            const activeIconColor = cat.color.replace('group-hover:', '')
                            const activeDarkIconColor = cat.darkColor.replace('dark:group-hover:', 'dark:')

                            // Labels: Shift shade for contrast (600->700 for light, 400->300 for dark)
                            const activeLabelColor = activeIconColor.replace('600', '700')
                            const activeDarkLabelColor = activeDarkIconColor.replace('400', '300')

                            if (isActive) {
                                return (
                                    <Link key={i} href={cat.href} className={`active group flex flex-col items-center justify-center min-w-[70px] px-2 py-2 rounded-xl transition-all duration-300 bg-transparent`}>
                                        <span className={`material-symbols-outlined mb-1 text-[26px] ${activeIconColor} ${activeDarkIconColor}`}>{cat.icon}</span>
                                        <span className={`text-[11px] font-bold tracking-wide transition-colors ${activeLabelColor} ${activeDarkLabelColor}`}>{cat.label}</span>
                                    </Link>
                                )
                            }
                            return (
                                <Link key={i} href={cat.href} className={`group flex flex-col items-center justify-center min-w-[70px] px-2 py-2 rounded-xl transition-all duration-300 bg-transparent ${cat.hoverBg} ${cat.darkHoverBg}`}>
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
