"use client";

import React from 'react';
import { Plane, Hotel, MapPin, XCircle, RefreshCw, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

interface CancelledBookingCardProps {
    booking: any;
}

export default function CancelledBookingCard({ booking }: CancelledBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';
    const router = require('next/navigation').useRouter();

    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;
    const reason = booking.metadata?.cancellation_reason || 'Hết hạn';

    const handleRebook = () => {
        // Construct detail URL
        let url = '/';
        if (isFlight) url = '/flights'; // Search page for flights
        else if (isHotel) url = `/hotels/${booking.metadata?.hotel_id || ''}`;
        else if (booking.category === 'activity') url = `/activities/${booking.metadata?.activity_id || ''}`;
        else if (booking.category === 'wellness') url = `/wellness/${booking.metadata?.experience_id || ''}`;
        else if (booking.category === 'transport') url = `/transport`;

        router.push(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col h-full bg-slate-50 dark:bg-white/5 rounded-[2rem] p-6 border border-transparent dark:border-white/5 opacity-80 hover:opacity-100 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 grayscale">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                    <XCircle size={12} strokeWidth={2} />
                    Đã hủy
                </div>
            </div>

            {/* Content */}
            <div className="mb-6 space-y-2">
                <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300 dark:decoration-slate-600 line-clamp-2">
                    {booking.title}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    Lý do: {reason}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
                <button
                    onClick={handleRebook}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={14} strokeWidth={2} />
                    Đặt lại
                </button>
            </div>
        </motion.div>
    );
}


