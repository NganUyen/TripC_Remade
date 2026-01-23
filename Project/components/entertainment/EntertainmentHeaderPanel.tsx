"use client"

import { MapPin, Calendar, Clock, Tag, Star, Music, Film, Ticket } from 'lucide-react'
import type { EntertainmentItem } from './mockData'

interface EntertainmentHeaderPanelProps {
    item: EntertainmentItem
}

export function EntertainmentHeaderPanel({ item }: EntertainmentHeaderPanelProps) {
    // Determine category icon
    const getCategoryIcon = (cat: string) => {
        if (cat.includes('concert')) return Music
        if (cat.includes('movie')) return Film
        return Ticket
    }

    const CategoryIcon = getCategoryIcon(item.category)

    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row">

                {/* LEFT: Meta Block */}
                <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
                    <div>
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <CategoryIcon className="w-3 h-3" /> {item.category.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-slate-900 dark:text-white">{item.rating}</span>
                                <span>({item.reviewCount})</span>
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
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Date</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.date}</p>
                                </div>
                            </div>
                            {item.startTime && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400">Time</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.startTime}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Venue</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{item.venue.name}</p>
                                    <p className="text-xs">{item.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Price</p>
                                    <p className="font-bold text-slate-900 dark:text-white">${item.price}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-black text-primary">${item.price}</span>
                        <button className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20 transition-all">
                            Check Availability
                        </button>
                    </div>
                </div>

                {/* RIGHT: Poster Image */}
                <div className="w-full lg:w-[400px] h-[300px] lg:h-auto relative bg-slate-100 dark:bg-slate-800">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                </div>
            </div>
        </section>
    )
}
