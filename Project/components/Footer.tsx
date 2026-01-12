import Link from 'next/link'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <Link href="#" className="flex items-center gap-2">
                            <div className="text-primary size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">travel_explore</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">TripC Pro</h2>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Your all-in-one travel companion. Discover, book, and experience the world with ease and confidence.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram'].map((social, i) => (
                                <a key={i} href="#" className="size-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary hover:text-white transition-colors">
                                    {social === 'facebook' && (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                                    )}
                                    {social === 'twitter' && (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                                    )}
                                    {social === 'instagram' && (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Company</h3>
                        <ul className="space-y-3">
                            {['About Us', 'Careers', 'Press', 'Blog'].map((item, i) => (
                                <li key={i}><Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm">{item}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Support</h3>
                        <ul className="space-y-3">
                            {['Help Center', 'Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item, i) => (
                                <li key={i}><Link href={item === 'Help Center' ? '/help-center' : '#'} className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm">{item}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Get the App</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Download now for exclusive deals.</p>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg py-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-lg">android</span>
                                <span className="text-xs font-bold">Google Play</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg py-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-lg">phone_iphone</span>
                                <span className="text-xs font-bold">App Store</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs">© 2024 TripC Pro. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <span className="material-symbols-outlined text-sm">language</span> English (US)
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <span className="material-symbols-outlined text-sm">currency_exchange</span> USD
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
