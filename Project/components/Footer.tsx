import Link from 'next/link'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-primary size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">travel_explore</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">TripC Pro</h2>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Your all-in-one travel companion. Discover, book, and experience the world with ease and confidence.
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Explore</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Flights', href: '/flights' },
                                { name: 'Hotels', href: '/hotels' },
                                { name: 'Activities', href: '/activities' },
                                { name: 'Shop', href: '/shop' },
                                { name: 'Transport', href: '/transport' },
                                { name: 'Entertainment', href: '/entertainment' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Support</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Help Center', href: '/help-center' },
                                { name: 'My Bookings', href: '/my-bookings' },
                                { name: 'My Profile', href: '/profile' },
                                { name: 'Wishlist', href: '/wishlist' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Partners */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">For Partners</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/partner" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">
                                    Partner Hub
                                </Link>
                            </li>
                            <li>
                                <Link href="/partner/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">
                                    Partner Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs font-medium">© 2025 TripC Pro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
