"use client";

import React, { useState } from 'react';
import { Clock, ShieldCheck, ArrowRight, CreditCard, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface PendingBookingCardProps {
    booking: any;
}

export default function PendingBookingCard({ booking }: PendingBookingCardProps) {
    const [timeLeft] = useState('02:00:00');
    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `#${booking.id.slice(0, 6).toUpperCase()}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="group relative card-compact flex flex-col h-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-100 dark:ring-white/5 overflow-hidden"
        >
            <div className="absolute top-0 right-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                CHỜ THANH TOÁN
            </div>

            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <CreditCard size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                            <span>{booking.category?.toUpperCase() || 'DỊCH VỤ'}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                            <span className="text-[#FF5E1F]">PENDING</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {booking.title}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock size={12} strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Thanh toán trước:</span>
                    </div>
                    <span className="text-[#FF5E1F] font-bold font-mono text-xs">{timeLeft}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="h-full bg-[#FF5E1F]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <Tag size={10} strokeWidth={1.5} /> MÃ ĐẶT CHỖ
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{bookingCode}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <User size={10} strokeWidth={1.5} /> KHÁCH HÀNG
                    </p>
                    <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{booking.metadata?.contact_name || 'Khách hàng'}</p>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
                <button className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none">
                    Thanh toán ngay
                    <ArrowRight size={14} strokeWidth={1.5} />
                </button>
                <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck size={12} strokeWidth={1.5} className="text-emerald-500" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Bảo mật chuẩn quốc tế</span>
                </div>
            </div>
        </motion.div>
    );
}

