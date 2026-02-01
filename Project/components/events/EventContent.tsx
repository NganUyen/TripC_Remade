"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Sun,
  CloudRain,
  Briefcase,
  Music,
  Mic2,
  Shirt,
  Beer,
  Tent,
  Zap,
  Star,
  Check,
  X,
  Info,
} from "lucide-react";
import Link from "next/link";
import { EventLocationSection } from '@/components/events/EventLocationSection';
import type { EventWithSessions } from '@/lib/events/types';

interface EventContentProps {
  event?: EventWithSessions;
}

export function EventContent({ event }: EventContentProps) {
  if (!event) return null;

  return (
    <div className="space-y-12">
      {/* About This Experience (Priority 1) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          About This Event
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {event.description || event.short_description || 'No description available.'}
        </p>
      </div>

      {/* Insider Tip - Minimalist Editorial Style (Priority 2) */}
      {event.important_info && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative pl-6 py-2 border-l-4 border-primary"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Important Info
            </span>
          </div>
          <p className="text-slate-900 dark:text-white text-lg md:text-xl font-medium leading-relaxed font-display">
            {event.important_info}
          </p>
        </motion.div>
      )}

      {/* Location & Venue */}
      <EventLocationSection event={event} />

      {/* Event Essentials */}
      <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-800/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Event Essentials
          </h4>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            QR Ticket (Digital or Print)
          </li>
          {event.age_restriction && (
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              {event.age_restriction} - Valid ID Required
            </li>
          )}
          {event.dress_code && (
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Dress Code: {event.dress_code}
            </li>
          )}
          <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Power Bank & Cables
          </li>
        </ul>
      </div>

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Event Highlights
          </h3>
          <div className="flex flex-wrap gap-3">
            {event.highlights.map((highlight, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-default"
              >
                <Sparkles className="w-4 h-4 text-[#FF5E1F]" />
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Included / Excluded */}
      {(event.inclusions?.length > 0 || event.exclusions?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {event.inclusions?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/10 rounded-[2rem] p-6 border border-green-100 dark:border-green-800/30">
              <h4 className="font-bold text-green-900 dark:text-green-300 flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-green-500" />
                What's Included
              </h4>
              <ul className="space-y-2">
                {event.inclusions.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.exclusions?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-[2rem] p-6 border border-red-100 dark:border-red-800/30">
              <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-red-500" />
                Not Included
              </h4>
              <ul className="space-y-2">
                {event.exclusions.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reviews
          </h3>
        </div>

        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">
              {event.average_rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(event.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400">
              based on {event.review_count} reviews
            </p>
          </div>

          <div className="flex-1 space-y-2 max-w-sm">
            {[5, 4, 3, 2, 1].map((rating, i) => (
              <div
                key={rating}
                className="flex items-center gap-3 text-xs font-bold text-slate-500"
              >
                <span className="w-3">{rating}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF5E1F] rounded-full"
                    style={{ width: i === 0 ? "85%" : i === 1 ? "10%" : "5%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {event.review_count === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className="min-w-[300px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + r)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Attendee {r}
                    </p>
                    <p className="text-xs text-slate-400">Verified Attendee</p>
                  </div>
                  <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">
                      5.0
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                  "Amazing experience! Well organized and great atmosphere. Highly recommend!"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
