"use client"

import { Check, X, MapPin } from 'lucide-react'
import type { ActivityItem } from './mockData'

interface ActivitiesDetailsProps {
    item: ActivityItem
}

export function ActivitiesDetails({ item }: ActivitiesDetailsProps) {
    return (
        <div className="space-y-12">

            {/* About Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    About This Experience
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-norma text-base whitespace-pre-line">
                        {item.longDescription || item.description}
                    </p>
                </div>
            </div>

            {/* Highlights */}
            {item.highlights && item.highlights.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Highlights
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
                        <ul className="grid grid-cols-1 gap-3">
                            {item.highlights.map((highlight, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="min-w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                        <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                                        {highlight}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Itinerary */}
            {item.itinerary && item.itinerary.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Itinerary
                    </h3>
                    <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {item.itinerary.map((day, i) => (
                            <div key={i} className="relative flex gap-6">
                                <div className="z-10 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-primary border-4 border-white dark:border-[#0a0a0a] shadow-sm" />
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{day.day}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{day.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{day.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inclusions & Exclusions */}
            {(item.inclusions || item.exclusions) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {item.inclusions && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Included</h3>
                            <ul className="space-y-3">
                                {item.inclusions.map((inc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{inc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {item.exclusions && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Not Included</h3>
                            <ul className="space-y-3">
                                {item.exclusions.map((exc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <X className="w-5 h-5 text-red-400 shrink-0" />
                                        <span>{exc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
