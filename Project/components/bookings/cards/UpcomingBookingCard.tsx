"use client";

import React from 'react';
import { Plane, Hotel, MapPin, ArrowUpRight, Ticket, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface UpcomingBookingCardProps {
    booking: any;
}

export default function UpcomingBookingCard({ booking }: UpcomingBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';

    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;
    const bookingDate = new Date(booking.start_date || new Date());

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent dark:border-white/5"
        >
            {/* Header: Icon & Category */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
                    Confirmed
                </div>
            </div>

            {/* Content: Date & Title */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Calendar size={12} />
                    {format(bookingDate, "EEEE, dd 'Thg' MM", { locale: vi })}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {booking.title}
                </h3>
            </div>

            {/* Footer: Location & Action */}
            <div className="mt-auto flex items-end justify-between pt-6">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
                    <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="text-sm font-medium truncate max-w-[160px]">
                        {booking.location_summary || 'Xem bản đồ'}
                    </span>
                </div>

                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                    <ArrowUpRight size={20} strokeWidth={1.5} />
                </button>
            </div>
        </motion.div>
    );
}
