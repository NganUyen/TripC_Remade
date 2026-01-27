
import React from 'react';
import { Plane, Hotel, Ticket, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CancelledBookingCardProps {
    booking: any;
}

export default function CancelledBookingCard({ booking }: CancelledBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';

    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `#${booking.id.slice(0, 6).toUpperCase()}`;
    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;

    // Check if trip is expired (start date passed)
    const isExpired = new Date(booking.start_date) < new Date();

    // Re-book Logic
    const handleRebook = () => {
        const params = new URLSearchParams();

        // Fallback parsing or use metadata
        const origin = booking.metadata?.origin || booking.location_summary?.split(' -> ')[0];
        const destination = booking.metadata?.destination || booking.location_summary?.split(' -> ')[1];

        if (origin) params.set('origin', origin);
        if (destination) params.set('destination', destination);

        // Default to same date if in future, otherwise tomorrow
        // actually, user wants "result displaying full results"
        // Let's default to a logical future date if expired, or the original date if not?
        // Wait, if it's expired, we definitely need a new date.
        // If it's NOT expired but cancelled, maybe they want the same date.

        let targetDate = new Date();
        if (isExpired) {
            targetDate.setDate(targetDate.getDate() + 1); // Tomorrow
        } else {
            targetDate = new Date(booking.start_date); // Same date
        }

        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');

        params.set('date', `${y}-${m}-${d}`);
        params.set('passengers', '1');

        return `/transport/results?${params.toString()}`;
    };

    const rebookUrl = handleRebook();

    // Derive status badge from metadata or random for demo if not specific
    const cancelReason = booking.metadata?.cancel_reason || 'ĐÃ HỦY';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full opacity-75 hover:opacity-100">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Icon size={24} />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-red-500'}`}></span>
                        {isExpired ? 'HẾT HẠN' : cancelReason}
                    </span>
                </div>
            </div>

            <div className="flex-1">
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BOOKING {bookingCode}</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                        {booking.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {isFlight ? 'HẠNG THƯƠNG GIA' : booking.description || 'CHI TIẾT'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(booking.start_date), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GIÁ TRỊ</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white opacity-60 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: booking.currency || 'VND' }).format(booking.total_amount)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
                {isExpired ? (
                    <div className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-3 rounded-full text-sm uppercase tracking-wide cursor-not-allowed">
                        <Eye size={16} />
                        Đã hết chỗ
                    </div>
                ) : (
                    <a
                        href={rebookUrl}
                        className="flex-1 flex items-center justify-center gap-2 border border-[#FF5E1F] text-[#FF5E1F] font-bold py-3 rounded-full hover:bg-[#FF5E1F] hover:text-white transition-all text-sm uppercase tracking-wide"
                    >
                        <RefreshCw size={16} />
                        Đặt lại ngay
                    </a>
                )}
            </div>
        </div>
    );
}
