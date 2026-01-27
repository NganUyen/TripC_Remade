"use client"

import { motion } from 'framer-motion'
import { Sparkles, Sun, CloudRain, Briefcase, Wifi, Waves, Wind, Utensils, Coffee, Gamepad2, Star } from 'lucide-react'
import Link from 'next/link'

export function HotelContent() {
    return (
        <div className="space-y-12">
            {/* AI Insight Magic Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2rem] p-px bg-gradient-to-r from-orange-400 to-purple-500 shadow-xl"
            >
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[1.9rem] p-6 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex items-start gap-4 relatie z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-2">
                                AI Insight: Perfect for Couples
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                "Guests rave about the <span className="text-orange-500 font-bold">Sunset Ocean Suites</span> for their privacy and direct beach access.
                                The <span className="text-purple-500 font-bold">Couples Spa Package</span> is highly recommended for rainy afternoons.
                                Note that the main pool gets busy around 2 PM, so try the adult-only infinity pool for quiet time."
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-orange-500" />
                            Weather Forecast
                        </h4>
                        <span className="text-xs font-bold bg-white dark:bg-blue-900/50 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300">May 12-15</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 dark:bg-black/20 rounded-xl p-4">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Fri</p>
                            <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">28°</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Sat</p>
                            <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">29°</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold mb-1">Sun</p>
                            <CloudRain className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                            <p className="font-bold text-slate-900 dark:text-white">26°</p>
                        </div>
                    </div>
                </div>

                {/* Packing List */}
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-6 border border-orange-100 dark:border-orange-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            Smart Packing
                        </h4>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Light rain jacket (Sunday)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Sunscreen & Hat (High UV)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Formal wear for Gala Dinner
                        </li>
                    </ul>
                </div>
            </div>

            {/* Amenities */}
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Amenity Highlights</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { icon: <Wifi className="w-4 h-4 text-slate-900 dark:text-white" />, label: "High-Speed Wifi" },
                        { icon: <Waves className="w-4 h-4 text-blue-500" />, label: "Infinity Pool" },
                        { icon: <Utensils className="w-4 h-4 text-orange-500" />, label: "Gourmet Dining" },
                        { icon: <Wind className="w-4 h-4 text-green-500" />, label: "Luxury Spa" },
                        { icon: <Coffee className="w-4 h-4 text-amber-700" />, label: "24/7 Cafe" },
                        { icon: <Gamepad2 className="w-4 h-4 text-purple-500" />, label: "Kids Club" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-default">
                            {item.icon}
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Reviews</h3>
                    <Link href="#" className="font-bold text-orange-500 hover:underline">View All</Link>
                </div>

                <div className="flex items-center gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">4.8</div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-xs font-bold text-slate-400">based on 1,240 reviews</p>
                    </div>

                    <div className="flex-1 space-y-2 max-w-sm">
                        {[5, 4, 3, 2, 1].map((rating, i) => (
                            <div key={rating} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <span className="w-3">{rating}</span>
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-400 rounded-full"
                                        style={{ width: i === 0 ? '70%' : i === 1 ? '20%' : '5%' }}
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
                                <img
                                    src={`https://images.unsplash.com/photo-${r === 1 ? '1494790108377-be9c29b29330' : r === 2 ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?q=80&w=150&auto=format&fit=crop`}
                                    alt="Reviewer"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</p>
                                    <p className="text-xs text-slate-400">May 2023 • Family Trip</p>
                                </div>
                                <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">5.0</span>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                                "Absolutely stunning resort! The staff went above and beyond. The kids loved the club and we loved the spa."
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
