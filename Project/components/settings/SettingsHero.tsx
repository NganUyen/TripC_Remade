"use client"

import { motion } from 'framer-motion'
import { Save, Ban, CheckCircle } from 'lucide-react'
import { springTransition } from './InternalComponents'

export function SettingsHero() {
    return (
        <section className="w-full pt-28 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springTransition}
                    className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6"
                >
                    {/* Left: User Info */}
                    <div className="flex items-center gap-6">
                        {/* Avatar with TripC Ring */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-[#FF5E1F] to-amber-500 shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop"
                                    alt="User"
                                    className="w-full h-full rounded-full object-cover border-4 border-[#fcfaf8] dark:border-[#0a0a0a]"
                                />
                            </div>
                            {/* Online Status */}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#fcfaf8] dark:border-[#0a0a0a] rounded-full" />
                        </div>

                        <div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-1">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Settings</h1>
                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-[#FF5E1F] dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-500/20">
                                    Digital Passport
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-3">
                                @alex.j • Account & preferences
                            </p>

                            {/* Mini Stats */}
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md text-green-700 dark:text-green-400">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Security: Strong
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                                    <span>2FA: On</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
                        <button className="flex-1 md:flex-none h-11 px-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 group">
                            <Ban className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                            <span>Cancel</span>
                        </button>
                        <button className="flex-1 md:flex-none h-11 px-6 rounded-full bg-[#FF5E1F] text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
