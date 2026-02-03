"use client"

import { Check, X, MapPin } from 'lucide-react'
import type { ActivityItem } from './mockData'

interface ActivitiesDetailsProps {
    item: ActivityItem
}

export function ActivitiesDetails({ item }: ActivitiesDetailsProps) {
    return (
        <div className="space-y-10">

            {/* About Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    About This Experience
                </h3>
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base whitespace-pre-line">
                        {item.longDescription || item.description}
                    </p>
                </div>
            </div>

            {/* Highlights */}
            {item.highlights && item.highlights.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Highlights
                    </h3>
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl p-6 border border-slate-100/50 dark:border-slate-800/50">
                        <ul className="grid grid-cols-1 gap-3">
                            {item.highlights.map((highlight, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="min-w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0">
                                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm leading-relaxed">
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
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Itinerary
                    </h3>
                    <div className="relative pl-2 space-y-8 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                        {item.itinerary.map((day, i) => (
                            <div key={i} className="relative flex gap-6 group">
                                <div className="z-10 flex flex-col items-center pt-1">
                                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-[3px] border-[#FF5E1F] shadow-sm group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5E1F] bg-[#FF5E1F]/5 px-2 py-0.5 rounded-full">{day.day}</span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{day.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{day.desc}</p>
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
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Included</h3>
                            <ul className="space-y-3">
                                {item.inclusions.map((inc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span>{inc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {item.exclusions && (
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Not Included</h3>
                            <ul className="space-y-3">
                                {item.exclusions.map((exc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <X className="w-5 h-5 text-red-500/70 shrink-0" />
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
