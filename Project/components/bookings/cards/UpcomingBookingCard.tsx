
import React from 'react';
import { Plane, Hotel, MapPin, Calendar, QrCode, Receipt, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UpcomingBookingCardProps {
    booking: any;
}

export default function UpcomingBookingCard({ booking }: UpcomingBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';

    // Mock data derivation or extraction from metadata if available
    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `#${booking.id.slice(0, 6).toUpperCase()}`;
    const subTitle = isFlight ? 'HẠNG THƯƠNG GIA' : isHotel ? '5 SAO' : 'TIÊU CHUẨN';

    const Icon = isFlight ? Plane : isHotel ? Hotel : Ticket;

    const iconBgColor = isFlight ? 'bg-blue-50 text-blue-600' : isHotel ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBgColor}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                            <span>{isFlight ? 'VÉ MÁY BAY' : isHotel ? 'KHÁCH SẠN' : 'DỊCH VỤ'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-primary">{subTitle}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                            {booking.title}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                        <MapPin size={20} />
                    </button>
                    <button className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                        <QrCode size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-100 dark:border-slate-800 border-dashed">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {isHotel ? 'NHẬN PHÒNG' : 'KHỞI HÀNH'}
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white">
                        {format(new Date(booking.start_date), "dd 'Thg' MM, yyyy", { locale: vi })}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                        {format(new Date(booking.start_date || new Date()), 'hh:mm a')}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        MÃ ĐẶT CHỖ
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white tracking-wide">
                        {bookingCode}
                    </p>
                </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="mr-auto flex gap-2">
                    {/* Optional extra slot for small icons/badges if needed */}
                </div>
                <button className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Quản lý đặt chỗ
                </button>
            </div>
        </div>
    );
}
