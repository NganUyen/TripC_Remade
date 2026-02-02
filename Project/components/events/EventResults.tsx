"use client"

import React from 'react'
import { Calendar, MapPin, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEvents, formatEventPrice, formatEventDate } from '@/hooks/use-events'
import { EventCardSkeleton } from './EventCardSkeleton'
import type { EventWithSessions } from '@/lib/events/types'
import { WishlistButton } from '@/components/WishlistButton'

interface EventResultsProps {
  city?: string
  category?: string
  search?: string
  limit?: number
}



export function EventResults({ city, category, search, limit = 20 }: EventResultsProps) {
  const { events, total, loading, error } = useEvents({
    city,
    category: category as any,
    search,
    limit,
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-slate-500 text-sm mt-2">Please try again later</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-medium">No events found</p>
        <p className="text-slate-400 text-sm mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  )
}

interface EventCardProps {
  event: EventWithSessions
  index: number
}

function EventCard({ event, index }: EventCardProps) {
  // Get the first upcoming session and its cheapest ticket
  const upcomingSession = event.sessions?.[0]
  const cheapestTicket = upcomingSession?.ticket_types?.reduce((min, t) =>
    t.price < min.price ? t : min,
    upcomingSession.ticket_types[0]
  )

  const displayDate = upcomingSession
    ? formatEventDate(upcomingSession.session_date)
    : 'Date TBA'

  const displayPrice = cheapestTicket
    ? formatEventPrice(cheapestTicket.price, cheapestTicket.currency)
    : 'Price TBA'

  const displayLocation = event.location_summary || event.city || 'Location TBA'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="group bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800 hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <Link href={`/events/${event.slug || event.id}`} className="block h-full">
        {/* Image */}
        <div className="h-48 relative overflow-hidden">
          {event.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white/50" />
            </div>
          )}


          {/* Wishlist button */}
          <div
            className="absolute top-4 right-4 z-10 transition-transform hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <WishlistButton
              itemId={event.id}
              itemType="event"
              title={event.title}
              imageUrl={event.cover_image_url || undefined}
              price={cheapestTicket?.price}
              className="bg-white/20 backdrop-blur-md border-transparent hover:bg-white text-white"
            />
          </div>

          {/* Featured badge */}
          {event.is_featured && (
            <div className="absolute top-4 left-4 bg-[#FF5E1F] text-white px-3 py-1 rounded-full text-xs font-bold">
              Featured
            </div>
          )}

          {/* Category badge */}
          {event.category && (
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
              {event.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2">
              {event.title}
            </h4>
          </div>

          {event.short_description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
              {event.short_description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#FF5E1F]" />
              <span>{displayDate}</span>
              {event.sessions?.length > 1 && (
                <span className="text-[#FF5E1F]">+{event.sessions.length - 1} more</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{displayLocation}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
            <div>
              <span className="text-[#FF5E1F] font-black text-lg">{displayPrice}</span>
              {cheapestTicket && (
                <span className="text-xs text-slate-400 ml-1">from</span>
              )}
            </div>
            <span className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity">
              View Event
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
