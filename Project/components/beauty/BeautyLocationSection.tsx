"use client"

import { MapPin } from 'lucide-react'
import type { BeautyVenue } from '@/lib/beauty/types'

interface BeautyLocationSectionProps {
    venue: BeautyVenue
}

export function BeautyLocationSection({ venue }: BeautyLocationSectionProps) {
    return (
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
            <div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 group">
                {/* Map Iframe */}
                {venue.latitude && venue.longitude ? (
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${venue.latitude},${venue.longitude}&hl=en&z=15&output=embed`}
                        className="w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                        title="Venue Location"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                        <p className="text-zinc-500">Map location not available</p>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute top-8 left-8 z-20 max-w-xs w-full">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/40 dark:border-zinc-700/50 shadow-2xl transition-all hover:bg-white/90 dark:hover:bg-zinc-900/90">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Open Now</span>
                        </div>
                        <h3 className="font-display text-xl font-bold mb-1 text-slate-900 dark:text-white line-clamp-1">{venue.name}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                            {venue.address || venue.location_summary || 'Address available upon booking'}
                        </p>

                        {(venue.latitude && venue.longitude) && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">directions</span>
                                Get Directions
                            </a>
                        )}
                    </div>
                </div>

                {/* Map Controls (Visual Only) */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                    <div className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 dark:border-zinc-700 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <span className="material-symbols-outlined">add</span>
                    </div>
                    <div className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 dark:border-zinc-700 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <span className="material-symbols-outlined">remove</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
