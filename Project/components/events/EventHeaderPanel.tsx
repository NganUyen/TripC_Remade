"use client";

import { MapPin, Calendar, Clock, Tag, Music, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatEventDate, formatEventTime, formatEventPrice } from '@/hooks/use-events';
import type { EventWithSessions } from '@/lib/events/types';

interface EventHeaderPanelProps {
  event?: EventWithSessions;
}

// Category to icon mapping
const CATEGORY_ICONS: Record<string, typeof Music> = {
  concert: Music,
  festival: Music,
  sports: Tag,
  theater: Tag,
  exhibition: Tag,
  conference: Tag,
  workshop: Tag,
  other: Tag,
};

export function EventHeaderPanel({ event }: EventHeaderPanelProps) {
  if (!event) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5E1F]" />
        </div>
      </section>
    );
  }

  // Get first session info
  const firstSession = event.sessions?.[0];
  const lastSession = event.sessions?.[event.sessions.length - 1];
  
  // Format date range
  const dateDisplay = firstSession && lastSession
    ? firstSession.session_date === lastSession.session_date
      ? formatEventDate(firstSession.session_date)
      : `${formatEventDate(firstSession.session_date)} - ${formatEventDate(lastSession.session_date)}`
    : 'Date TBA';

  // Format time
  const timeDisplay = firstSession
    ? `${formatEventTime(firstSession.start_time)}${firstSession.end_time ? ` - ${formatEventTime(firstSession.end_time)}` : ''}`
    : 'Time TBA';

  // Get cheapest price
  const allTicketTypes = event.sessions?.flatMap(s => s.ticket_types) || [];
  const cheapestTicket = allTicketTypes.reduce((min, t) => 
    !min || t.price < min.price ? t : min,
    null as typeof allTicketTypes[0] | null
  );
  const priceDisplay = cheapestTicket 
    ? `From ${formatEventPrice(cheapestTicket.price, cheapestTicket.currency)}`
    : 'Price TBA';

  const CategoryIcon = event.category ? (CATEGORY_ICONS[event.category] || Tag) : Tag;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* LEFT: Meta Block */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {event.category && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <CategoryIcon className="w-3 h-3" /> {event.category}
                </span>
              )}
              {event.is_featured && (
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  Featured
                </span>
              )}
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-slate-900 dark:text-white">
                  {event.average_rating.toFixed(1)}
                </span>
                <span>({event.review_count})</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Date
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {dateDisplay}
                  </p>
                  {event.sessions?.length > 1 && (
                    <p className="text-xs text-[#FF5E1F]">{event.sessions.length} sessions available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Time
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {timeDisplay}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Venue
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {event.venue_name || 'Venue TBA'}
                  </p>
                  <p className="text-xs">{event.city || event.location_summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Price
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {priceDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row - Like Ticketbox */}
          <div className="hidden lg:flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-2xl font-black text-primary">
              {priceDisplay}
            </span>
            <button 
              onClick={() => {
                // Scroll to booking sidebar or open mobile modal
                document.getElementById('booking-sidebar')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20 transition-all"
            >
              Get Tickets
            </button>
          </div>
        </div>

        {/* RIGHT: Poster Image */}
        <div className="w-full lg:w-[400px] h-[300px] lg:h-auto relative bg-slate-100 dark:bg-slate-800">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <CategoryIcon className="w-20 h-20 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
