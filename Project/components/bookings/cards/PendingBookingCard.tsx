"use client";

import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PendingBookingCardProps {
    booking: any;
}

export default function PendingBookingCard({ booking }: PendingBookingCardProps) {
    const [timeLeft, setTimeLeft] = useState('Checking...');
    const [progress, setProgress] = useState(100);
    const router = useRouter();

    useEffect(() => {
        if (!booking.expires_at) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiryTime = new Date(booking.expires_at).getTime();
            const createdTime = new Date(booking.created_at).getTime();

            const distance = expiryTime - now;
            const totalDuration = expiryTime - createdTime;

            if (distance < 0) {
                setTimeLeft("Đã hết hạn");
                setProgress(0);
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            setProgress((distance / totalDuration) * 100);
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [booking.expires_at, booking.created_at]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 border border-orange-100 dark:border-orange-500/20"
        >
            {/* Header: Status & Icon */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400">
                    <CreditCard size={24} strokeWidth={1.5} />
                </div>
                <div className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 animate-pulse">
                    <Clock size={12} strokeWidth={2} />
                    Chờ thanh toán
                </div>
            </div>

            {/* Content: Title & Timer */}
            <div className="mb-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {booking.title}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <span>Hết hạn trong:</span>
                    <span className="font-mono text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded-md">
                        {timeLeft}
                    </span>
                </div>
            </div>

            {/* Action */}
            <div className="mt-auto pt-4 space-y-4">
                <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-orange-500 rounded-full"
                    />
                </div>

                {timeLeft === "Đã hết hạn" ? (
                    <div className="text-center py-3 text-red-600 dark:text-red-400 font-bold text-sm">
                        Đơn đặt chỗ đã hết hạn thanh toán
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => router.push(`/payment?bookingId=${booking.id}`)}
                            className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200/50 dark:shadow-none"
                        >
                            Thanh toán ngay
                            <ArrowRight size={16} strokeWidth={2} />
                        </button>

                        <div className="flex items-center justify-center gap-1.5 opacity-60">
                            <ShieldCheck size={12} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500" />
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Giao dịch an toàn</span>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

