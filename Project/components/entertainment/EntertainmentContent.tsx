"use client"

import { motion } from 'framer-motion'
import { 
  Sparkles, Sun, CloudRain, Briefcase, MapPin, Clock, 
  Ticket, Users, Accessibility, Star, Check, Camera,
  Music, Utensils, ShoppingBag, Wifi, Zap
} from 'lucide-react'
import Link from 'next/link'
import type { EntertainmentItem } from './mockData'
import { getReviewsById } from './mockData'

interface EntertainmentContentProps {
  item: EntertainmentItem
}

export function EntertainmentContent({ item }: EntertainmentContentProps) {
  const reviews = getReviewsById(item.id)
  
  // Calculate rating distribution
  const ratingDistribution = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 18 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ]

  // Map features to icons
  const featureIcons: Record<string, any> = {
    'Parking Available': MapPin,
    'Food & Drinks': Utensils,
    'Merchandise Shop': ShoppingBag,
    'LED Wristbands': Zap,
    'Photography Allowed': Camera,
    'Accessible Seating': Accessibility,
    'WiFi': Wifi,
    'Air Conditioned': Sun,
    'Restaurants': Utensils,
    'Souvenir Shops': ShoppingBag,
    'Character Meet & Greets': Users,
    'First Aid': Check,
    'Audio Guides': Music,
    'Cafe & Restaurant': Utensils,
    'Museum Shop': ShoppingBag,
    'Free WiFi': Wifi,
    'Bar/Concessions': Utensils,
    'Coat Check': Check,
    'Playbill Included': Ticket,
    'Gift Shop': ShoppingBag,
    'Big Screen Replays': Camera,
    'Family Section': Users,
    'Stroller Rental': Users
  }

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

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-2">
                AI Insight: Smart Tips for Your Visit
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {item.aiInsight}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Event Details & What to Bring Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
              Event Details
            </h4>
          </div>
          <div className="space-y-3">
            {item.duration && (
              <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Duration</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.duration}</span>
              </div>
            )}
            {item.startTime && (
              <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Start Time</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.startTime}</span>
              </div>
            )}
            {item.ageRestriction && (
              <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Age</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.ageRestriction}</span>
              </div>
            )}
          </div>
        </div>

        {/* Weather Widget (if outdoor) or Venue Info */}
        {item.isOutdoor ? (
          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-6 border border-orange-100 dark:border-orange-800/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                <Sun className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                Weather Forecast
              </h4>
              <span className="text-xs font-bold bg-white dark:bg-orange-900/50 px-2 py-1 rounded-md text-orange-600 dark:text-orange-300">
                {item.date.split(',')[0]}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/60 dark:bg-black/20 rounded-xl p-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Day</p>
                <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" strokeWidth={1.5} />
                <p className="font-bold text-slate-900 dark:text-white">24°</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Eve</p>
                <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" strokeWidth={1.5} />
                <p className="font-bold text-slate-900 dark:text-white">22°</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Night</p>
                <CloudRain className="w-6 h-6 text-blue-400 mx-auto mb-1" strokeWidth={1.5} />
                <p className="font-bold text-slate-900 dark:text-white">18°</p>
              </div>
            </div>
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium">
              Possible showers later - bring a light jacket
            </p>
          </div>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" strokeWidth={1.5} />
                Venue Information
              </h4>
            </div>
            <div className="space-y-3">
              <div className="bg-white/60 dark:bg-black/20 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.venue.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.address}</p>
              </div>
              {item.venue.capacity && (
                <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Capacity</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.venue.capacity.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* About This Event */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About This Event</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {item.longDescription}
          </p>
          {item.highlights.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Highlights</h4>
              <ul className="space-y-2">
                {item.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      {item.features.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">What's Included</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {item.features.map((feature, i) => {
              const Icon = featureIcons[feature] || Check
              return (
                <div
                  key={i}
                  className="aspect-square rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all group cursor-default"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
                  </div>
                  <span className="font-bold text-xs text-slate-600 dark:text-slate-300 text-center px-2 leading-tight">
                    {feature}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Accessibility */}
      {item.accessibility.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/10 rounded-[2rem] p-6 border border-green-100 dark:border-green-800/30">
          <h4 className="font-bold text-green-900 dark:text-green-300 flex items-center gap-2 mb-4">
            <Accessibility className="w-5 h-5 text-green-600" strokeWidth={1.5} />
            Accessibility Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {item.accessibility.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-green-600 shrink-0" strokeWidth={1.5} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Reviews</h3>
          <Link href="#" className="font-bold text-orange-500 hover:underline text-sm">
            View All
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">
              {item.rating}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400">
              based on {item.reviewCount.toLocaleString()} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2 w-full max-w-sm">
            {ratingDistribution.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <span className="w-3">{rating.stars}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right">{rating.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        {reviews.length > 0 && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-[300px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={review.userImage}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{review.userName}</p>
                    <p className="text-xs text-slate-400">
                      {review.date} • {review.tripType}
                    </p>
                  </div>
                  <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                  {review.comment}
                </p>
                {review.verified && (
                  <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                    Verified Attendee
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
