"use client";

import React from 'react';
import { Plane, Hotel, MapPin, QrCode, Ticket, ArrowRight, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface UpcomingBookingCardProps {
    booking: any;
}

export default function UpcomingBookingCard({ booking }: UpcomingBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';

    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `#${booking.id.slice(0, 6).toUpperCase()}`;
    const subTitle = isFlight ? 'Thương gia' : isHotel ? '5 sao' : 'Dịch vụ';

    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative card-compact flex flex-col h-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[1.5rem] p-5"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#FF5E1F] group-hover:bg-[#FF5E1F]/5 transition-all duration-300">
                        <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                            <span>{isFlight ? 'VÉ MÁY BAY' : isHotel ? 'KHÁCH SẠN' : 'DỊCH VỤ'}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                            <span className="text-slate-400">{subTitle}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {booking.title}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <Share2 size={16} strokeWidth={1.5} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-[#FF5E1F] transition-colors">
                        <QrCode size={16} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 border-dashed relative">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {isHotel ? 'NHẬN PHÒNG' : 'KHỞI HÀNH'}
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {format(new Date(booking.start_date), "dd 'Thg' MM", { locale: vi })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                        {format(new Date(booking.start_date || new Date()), 'hh:mm a')}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        MÃ ĐẶT CHỖ
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white tracking-wider text-sm">
                        {bookingCode}
                    </p>
                    <p className="text-[9px] text-emerald-500 font-bold mt-1 uppercase flex items-center gap-1">
                        <span className="size-1 rounded-full bg-emerald-500"></span>
                        Xác nhận
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4">
                <div className="flex items-center gap-1.5 text-slate-400 transition-colors">
                    <MapPin size={12} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium truncate max-w-[120px]">
                        {booking.location_summary || 'Xem bản đồ'}
                    </span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white text-slate-900 dark:text-white hover:text-white dark:hover:text-slate-900 text-[11px] font-bold transition-all group/btn">
                    Chi tiết
                    <ArrowRight size={12} strokeWidth={2} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
