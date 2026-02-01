"use client";

import React from "react";
import {
  Ticket,
  MapPin,
  ArrowUpRight,
  Calendar,
  Clock,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";

interface EntertainmentBookingCardProps {
  booking: any;
}

export default function EntertainmentBookingCard({
  booking,
}: EntertainmentBookingCardProps) {
  const eventDate = booking.event_date
    ? new Date(booking.event_date)
    : new Date(booking.created_at);
  const hasImage = booking.image && booking.image !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent dark:border-white/5"
    >
      {/* Image Header */}
      {hasImage && (
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-orange-500 to-pink-500">
          <img
            src={booking.image}
            alt={booking.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold tracking-wide uppercase shadow-lg">
            Đã đặt
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* No Image Header */}
        {!hasImage && (
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white group-hover:scale-110 transition-transform duration-500">
              <Ticket size={24} strokeWidth={1.5} />
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
              Đã đặt
            </div>
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="mb-4 space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
            {booking.title}
          </h3>
          {booking.subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
              {booking.subtitle}
            </p>
          )}
        </div>

        {/* Booking Details */}
        <div className="space-y-2 mb-4 flex-1">
          {/* Confirmation Code */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
            <Hash size={14} strokeWidth={2} className="flex-shrink-0" />
            <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
              {booking.booking_reference}
            </span>
          </div>

          {/* Event Date & Time */}
          {booking.event_date && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Calendar size={14} strokeWidth={2} className="flex-shrink-0" />
              <span className="font-semibold">
                {format(eventDate, "dd 'Thg' MM, yyyy", { locale: vi })}
              </span>
            </div>
          )}

          {/* Event Time */}
          {booking.event_time && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Clock size={14} strokeWidth={2} className="flex-shrink-0" />
              <span className="font-medium">{booking.event_time}</span>
            </div>
          )}

          {/* Quantity */}
          {booking.quantity && booking.quantity > 1 && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Ticket size={14} strokeWidth={2} className="flex-shrink-0" />
              <span className="font-medium">{booking.quantity}x Vé</span>
            </div>
          )}
        </div>

        {/* Footer: Location & Action */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
            <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="text-sm font-medium truncate max-w-[160px]">
              {booking.location || "Event Location"}
            </span>
          </div>

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
            <ArrowUpRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Price */}
        {booking.total_amount && (
          <div className="mt-3 text-right">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Tổng:{" "}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ${booking.total_amount}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
