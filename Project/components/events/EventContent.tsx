"use client"

import { motion } from 'framer-motion'
import { Sparkles, Sun, CloudRain, Briefcase, Music, Mic2, Shirt, Beer, Tent, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { EventDetails } from './EventDetails'

export function EventContent() {
    return (
        <div className="space-y-12">
            {/* AI Insight Magic Card */}
            {/* Insider Tip - Tier 3 Overlay */}
            {/* About This Experience (Priority 1) */}
            <EventDetails />

            {/* Insider Tip - Minimalist Editorial Style (Priority 2) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative pl-6 py-2 border-l-4 border-primary"
            >
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        Insider Tip
                    </span>
                </div>
                <p className="text-slate-900 dark:text-white text-lg md:text-xl font-medium leading-relaxed font-display italic">
                    "Arrive early for the <span className="font-bold">Sunset Acoustic Set</span>. The food truck line peaks at 7 PM, so grab a bite before then!"
                </p>
            </motion.div>



            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-[#FF5E1F]" />
                            Event Forecast
                        </h4>
                        <span className="text-xs font-bold bg-white dark:bg-blue-900/50 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300">Aug 12-14</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 dark:bg-black/20 rounded-xl p-4">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Fri</p>
                            <Sun className="w-6 h-6 text-[#FF5E1F] mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">28°</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Sat</p>
                            <Sun className="w-6 h-6 text-[#FF5E1F] mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">30°</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Sun</p>
                            <CloudRain className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">25°</p>
                        </div>
                    </div>
                </div>

                {/* Event Essentials */}
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-500" />
                            Event Essentials
                        </h4>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Government ID (21+)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> QR Ticket (Digital or Print)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Power Bank & Cables
                        </li>
                    </ul>
                </div>
            </div>

            {/* Highlights */}
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Event Highlights</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { icon: <Music className="w-4 h-4 text-slate-900 dark:text-white" />, label: "Live Bands" },
                        { icon: <Beer className="w-4 h-4 text-amber-500" />, label: "Craft Beer" },
                        { icon: <Tent className="w-4 h-4 text-green-500" />, label: "Camping Zone" },
                        { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: "Light Show" },
                        { icon: <Shirt className="w-4 h-4 text-blue-500" />, label: "Exclusive Merch" },
                        { icon: <Mic2 className="w-4 h-4 text-purple-500" />, label: "Meet & Greet" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-default">
                            {item.icon}
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lineup / Schedule Teaser could go here */}

            {/* Reviews */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Past Vibes</h3>
                    <Link href="#" className="font-bold text-[#FF5E1F] hover:underline">View Gallery</Link>
                </div>

                <div className="flex items-center gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">4.9</div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-xs font-bold text-slate-400">based on 840 reviews</p>
                    </div>

                    <div className="flex-1 space-y-2 max-w-sm">
                        {[5, 4, 3, 2, 1].map((rating, i) => (
                            <div key={rating} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <span className="w-3">{rating}</span>
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FF5E1F] rounded-full"
                                        style={{ width: i === 0 ? '85%' : i === 1 ? '10%' : '5%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                    {[1, 2, 3].map((r) => (
                        <div key={r} className="min-w-[300px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://images.unsplash.com/photo-${r === 1 ? '1535713875002-d1d0cf377fde' : r === 2 ? '1527980965255-d3b416303d12' : '1438761681033-6461ffad8d80'}?q=80&w=150&auto=format&fit=crop`}
                                    alt="Reviewer"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Alex Raver</p>
                                    <p className="text-xs text-slate-400">Aug 2025 • VIP Pass</p>
                                </div>
                                <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">5.0</span>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                                "Best weekend of my life! The sound system was incredible and the crowd was pure energy. Can't wait for next year."
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
