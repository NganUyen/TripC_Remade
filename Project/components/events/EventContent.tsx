"use client"

import { motion } from 'framer-motion'
import { Sparkles, Sun, CloudRain, Briefcase, Music, Mic2, Shirt, Beer, Tent, Zap, Star, Activity } from 'lucide-react'
import Link from 'next/link'

export function EventContent() {
    return (
        <div className="space-y-12">
            {/* AI Insight Magic Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2rem] p-px bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl"
            >
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[1.9rem] p-6 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex items-start gap-4 relatie z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                                AI Insight: Don't Miss Out
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                "This year's <span className="text-purple-500 font-bold">Main Stage Headline</span> is rumored to have a surprise guest.
                                Arrive early for the <span className="text-pink-500 font-bold">Sunset Acoustic Set</span> at the smaller stage.
                                TIP: The food truck line gets long at 7 PM, so grab a bite early!"
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* About This Experience */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">About This Experience</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <p>
                        Get ready for the ultimate summer music festival experience in the heart of the city.
                        Start your journey with a scenic ferry ride to the island venue, followed by a welcome drink at the Sunset Lounge.
                        As the sun goes down, the Main Stage comes alive with world-class performances.
                        Between sets, explore the silent disco, artisan food market, and interactive art installations.
                        Ends with a spectacular drone light show finale. Suitable for music lovers of all ages.
                    </p>
                </div>
            </div>

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
