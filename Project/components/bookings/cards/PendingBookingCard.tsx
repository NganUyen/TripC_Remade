
import React from 'react';
import { Plane, Hotel, Ticket, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PendingBookingCardProps {
    booking: any;
}

export default function PendingBookingCard({ booking }: PendingBookingCardProps) {
    const isFlight = booking.category === 'flight';
    const isHotel = booking.category === 'hotel';
    const isActivity = booking.category === 'activity';
    const isWellness = booking.category === 'wellness';

    const bookingCode = booking.booking_code || booking.metadata?.booking_code || `ORD-${booking.id.slice(0, 8).toUpperCase()}`;

    const Icon = isFlight ? Plane : isHotel ? Hotel : isActivity ? Ticket : isWellness ? Ticket : Ticket;


    // Calculate remaining time
    const [timeLeft, setTimeLeft] = React.useState<string>("");

    React.useEffect(() => {
        if (!booking.expires_at) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(booking.expires_at).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
                // Ideally trigger a refresh
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [booking.expires_at]);

    // Handle resume link - Always go to generic payment page now
    const resumeUrl = `/payment?bookingId=${booking.id}`;

    if (timeLeft === "EXPIRED") return null; // Or show expired state

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Top Banner for "Sắp hết hạn" or similar status if needed */}
            {/* <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Sắp hết hạn</div> */}

            <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                    <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-nowrap">
                            {isFlight ? `VÉ MÁY BAY GIÁ TRỊ CAO` : isHotel ? `ĐẶT PHÒNG KHÁCH SẠN` : isActivity ? `HOẠT ĐỘNG & TRẢI NGHIỆM` : isWellness ? `Nghỉ dưỡng & Retreat` : `DỊCH VỤ`}
                        </span>
                        <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded uppercase tracking-wider text-nowrap">
                            SẮP HẾT HẠN
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                        {booking.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                        {booking.description || 'Chuyến bay thẳng • Vietnam Airlines • 12h 45m'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">HÀNH KHÁCH</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {booking.guest_details?.firstName} {booking.guest_details?.lastName}
                        {booking.guest_details?.passengersCount > 1 ? ` +${booking.guest_details.passengersCount - 1}` : ''}
                    </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">KHỞI HÀNH</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{format(new Date(booking.start_date), "dd 'Thg' MM, yyyy", { locale: vi })}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">MÃ ĐẶT CHỖ</p>
                    <p className="text-xs font-bold text-orange-500">{bookingCode}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">HẠNG VÉ</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{booking.metadata?.vehicleType || 'Phổ thông'}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl items-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs italic md:w-1/2">
                    <AlertCircle size={14} />
                    <span>Vui lòng thanh toán để xác nhận giá vé. Giá có thể thay đổi sau khi thời gian giữ chỗ kết thúc.</span>
                </div>
                <div className="flex flex-col items-center md:items-end w-full md:w-1/2 gap-3">
                    <div className="flex items-center gap-2 text-red-500 font-bold border-b-2 border-red-500/20 pb-2 w-full justify-center md:justify-end">
                        <Clock size={16} className="animate-pulse" />
                        <span className="text-xl tabular-nums">{timeLeft || '--:--'}</span>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">TỔNG CỘNG (ĐÃ GỒM THUẾ)</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: booking.currency || 'VND' }).format(booking.total_amount)}
                        </p>
                    </div>

                    <a
                        href={resumeUrl}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF5E1F] hover:bg-[#ff4e08] text-white font-bold py-3 rounded-full shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                    >
                        Thanh toán ngay
                        <ArrowRight size={16} />
                    </a>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HỖ TRỢ 24/7: 1900 6000</p>
                </div>
            </div>
        </div>
    );
}
