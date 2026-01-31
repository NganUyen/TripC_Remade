"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Bus, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TransportBookingCardProps {
    booking: any; // Type accurately if possible
}

export default function TransportBookingCard({ booking }: TransportBookingCardProps) {
    const router = useRouter();

    // Parse metadata safely
    const meta = booking.metadata?.metadata || booking.metadata || {};
    const origin = meta.pickupLocation || 'Origin';
    const destination = meta.dropoffLocation || 'Destination';
    const vehicleType = meta.vehicleType || 'Transport';
    const passengerCount = meta.passengerCount || 1;
    const pickupTime = meta.pickupTime || booking.start_date;

    const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
    const isCancelled = booking.status === 'cancelled';

    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
                <Badge
                    variant={isConfirmed ? "default" : isCancelled ? "destructive" : "secondary"}
                    className={isConfirmed ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                    {isConfirmed ? "Đã đặt" : isCancelled ? "Đã hủy" : "Chờ thanh toán"}
                </Badge>
            </div>

            <div className="p-6">
                {/* Header: Route */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                        <Bus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                            {vehicleType}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{origin}</span>
                            <ArrowRight size={14} />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{destination}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={16} />
                        <span>{new Date(pickupTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <User size={16} />
                        <span>{passengerCount} Khách</span>
                    </div>
                </div>

                {/* Footer: Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Tổng tiền</p>
                        <p className="text-lg font-bold text-[#FF5E1F]">
                            {/* Transport often uses VND, check currency */}
                            {formatCurrency(booking.total_amount, booking.currency || 'VND')}
                        </p>
                    </div>

                    {!isConfirmed && !isCancelled && (
                        <Button
                            onClick={() => router.push(`/payment?bookingId=${booking.id}`)}
                            className="bg-[#FF5E1F] hover:bg-[#ff4e0b] text-white rounded-full px-6"
                        >
                            Thanh toán
                        </Button>
                    )}

                    {isCancelled && (
                        <Button variant="outline" className="rounded-full">
                            Đặt lại
                        </Button>
                    )}

                    {isConfirmed && (
                        <Button variant="ghost" className="rounded-full text-slate-500" onClick={() => router.push(`/transport/checkout?bookingId=${booking.id}`)}>
                            Chi tiết
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
