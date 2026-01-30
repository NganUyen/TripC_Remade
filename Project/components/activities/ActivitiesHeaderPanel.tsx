"use client"

import { MapPin, Clock, Star, Activity, Award, User, Info } from 'lucide-react'
import type { ActivityItem } from './mockData'

interface ActivitiesHeaderPanelProps {
    item: ActivityItem
}

export function ActivitiesHeaderPanel({ item }: ActivitiesHeaderPanelProps) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row">

                {/* LEFT: Meta Block */}
                <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
                    <div>
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {item.category}
                            </span>
                            {item.bestseller && (
                                <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Bestseller
                                </span>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-slate-900 dark:text-white">{item.rating}</span>
                                <span>({item.reviews} reviews)</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                            {item.title}
                        </h1>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Duration</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.duration}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Location</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Type</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.instant ? 'Instant Confirmation' : '24h Confirmation'}</p>
                                </div>
                            </div>

                            {item.host && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400">Hosted By</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.host.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Row mobile only - Desktop uses sticky widget */}
                    <div className="lg:hidden flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase">From</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-primary">${item.price}</span>
                                {item.oldPrice && (
                                    <span className="text-sm text-slate-400 line-through">${item.oldPrice}</span>
                                )}
                            </div>
                        </div>
                        <button className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20 transition-all">
                            Check Availability
                        </button>
                    </div>
                </div>

                {/* RIGHT: Poster Image */}
                <div className="w-full lg:w-[450px] h-[300px] lg:h-auto relative bg-slate-100 dark:bg-slate-800">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />

                    {/* Floating Price Tag for Desktop */}
                    <div className="hidden lg:flex absolute top-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex-col items-end">
                        <span className="text-xs font-bold uppercase text-slate-500">From</span>
                        <div className="flex items-baseline gap-2">
                            {item.oldPrice && (
                                <span className="text-sm text-slate-400 line-through">${item.oldPrice}</span>
                            )}
                            <span className="text-2xl font-black text-primary">${item.price}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
