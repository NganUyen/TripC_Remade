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

    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `#${booking.id.slice(0, 6).toUpperCase()}`;
    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative card-compact flex flex-col h-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 opacity-60 hover:opacity-100"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-slate-400 transition-colors">
                        <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                            <span>{isFlight ? 'VÉ MÁY BAY' : isHotel ? 'KHÁCH SẠN' : 'DỊCH VỤ'}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                            <span>ĐÃ HỦY</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-1 transition-colors">
                            {booking.title}
                        </h3>
                    </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-200 group-hover:text-slate-400 transition-colors">
                    <XCircle size={16} strokeWidth={1.5} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100 dark:border-white/5 border-dashed mb-4">
                <div>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">MÃ ĐẶT CHỖ</p>
                    <p className="font-bold text-slate-300 line-through text-xs">{bookingCode}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5 text-right">LÝ DO HỦY</p>
                    <p className="text-[10px] font-bold text-slate-300 text-right uppercase truncate">
                        {booking.metadata?.cancellation_reason || 'Hết hạn'}
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={12} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium truncate max-w-[100px]">
                        {booking.location_summary || 'Đã hủy'}
                    </span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white text-slate-300 hover:text-white dark:hover:text-slate-900 text-[11px] font-bold transition-all group/btn">
                    Đặt lại
                    <RefreshCw size={12} strokeWidth={1.5} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                </button>
            </div>
        </motion.div>
    );
}


