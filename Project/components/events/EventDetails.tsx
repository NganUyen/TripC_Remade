"use client"

import { Info, Calendar, Clock, User, FileText } from 'lucide-react'
import { formatEventDate, formatEventTime, formatEventPrice } from '@/hooks/use-events'
import { EventLocationSection } from '@/components/events/EventLocationSection'
import type { EventWithSessions } from '@/lib/events/types'

interface EventDetailsProps {
    event?: EventWithSessions
}

export function EventDetails({ event }: EventDetailsProps) {
    if (!event) return null

    return (
        <div className="space-y-8">
            {/* Venue & Location Details */}
            <EventLocationSection event={event} />

            {/* Sessions & Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sessions & Schedule</h3>
                </div>

                <div className="space-y-4">
                    {event.sessions?.map((session, index) => (
                        <div
                            key={session.id}
                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {session.name || `Session ${index + 1}`}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {formatEventDate(session.session_date)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {formatEventTime(session.start_time)}
                                        {session.end_time && ` - ${formatEventTime(session.end_time)}`}
                                    </span>
                                </div>
                            </div>

                            {/* Ticket types for this session */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {session.ticket_types?.map((ticket) => {
                                    const available = ticket.total_capacity - ticket.sold_count - ticket.held_count
                                    const isSoldOut = available <= 0

                                    return (
                                        <div
                                            key={ticket.id}
                                            className={`
                                                px-3 py-1.5 rounded-full text-xs font-bold
                                                ${isSoldOut
                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                }
                                            `}
                                        >
                                            {ticket.name}: {formatEventPrice(ticket.price, ticket.currency)}
                                            {isSoldOut && ' (Sold Out)'}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Organizer Info */}
            {event.organizer_name && (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Organizer</h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {event.organizer_logo_url ? (
                            <img
                                src={event.organizer_logo_url}
                                alt={event.organizer_name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                                {event.organizer_name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">{event.organizer_name}</p>
                            {event.organizer_contact && (
                                <p className="text-sm text-slate-500">{event.organizer_contact}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Terms & Conditions */}
            {event.terms_and_conditions && (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                        {event.terms_and_conditions}
                    </div>
                </div>
            )}
        </div>
    )
}
