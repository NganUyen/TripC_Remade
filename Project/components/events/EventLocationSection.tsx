"use client"

import { MapPin } from 'lucide-react'
import { WeatherForecast } from '@/components/hotels/WeatherForecast'
import type { EventWithSessions } from '@/lib/events/types'

interface EventLocationSectionProps {
    event: EventWithSessions
}

export function EventLocationSection({ event }: EventLocationSectionProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Venue & Location</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Venue</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.venue_name || 'Venue TBA'}
                    </p>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Address</p>
                    <p className="text-slate-600 dark:text-slate-300">
                        {event.address || event.location_summary || 'Address TBA'}
                    </p>
                    {event.city && (
                        <p className="text-slate-500 text-sm mt-1">{event.city}</p>
                    )}
                </div>
            </div>

            {/* Map & Weather */}
            {(event.latitude && event.longitude) && (
                <div className="mt-6 flex flex-col gap-6">
                    <div className="h-64 w-full rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative group">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${event.latitude},${event.longitude}&hl=en&z=15&output=embed`}
                            className="w-full h-full grayscale-[50%] group-hover:grayscale-0 transition-all duration-500"
                            title="Event Location"
                        />
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <MapPin className="w-3 h-3 text-[#FF5E1F]" />
                            Open in Maps
                        </a>
                    </div>

                    {/* Weather Forecast */}
                    <WeatherForecast latitude={event.latitude} longitude={event.longitude} />
                </div>
            )}
        </div>
    )
}
