"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CheckoutBookingSummaryProps {
    type: 'transport' | 'wellness' | 'activity' | 'flight';
    details: any; // Flexible Details depending on type
    booking: any;
}

export function BookingSummary({ type, details, booking }: CheckoutBookingSummaryProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    const expiresAt = booking?.expires_at;

    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!details || !booking) return null;

    const total = booking.total_amount;
    const formattedDate = new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let image = booking.image_url;
    // Fallback images
    if (!image) {
        if (type === 'transport') image = details.images?.[0];
        else if (type === 'wellness') image = details.image_url;
        else if (type === 'activity') image = details.image_url;
        else if (type === 'flight') image = "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=2670&auto=format&fit=crop";
    }
    if (!image) image = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop";

    return (
        <div className="card-shell w-full lg:w-[460px] p-8 md:p-10 flex flex-col bg-white dark:bg-[#1b1a18] border border-border-subtle dark:border-[#333] rounded-card shadow-sm dark:shadow-none sticky top-24">

            {/* Timer Banner for Held Bookings */}
            {booking.status === 'held' && expiresAt && timeLeft !== "EXPIRED" && (
                <div className="mb-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex items-center justify-between mb-8 animate-pulse">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold text-sm">Reservation Hold</span>
                    </div>
                    <span className="font-black text-xl text-orange-600 dark:text-orange-500 tabular-nums">
                        {timeLeft}
                    </span>
                </div>
            )}

            <h2 className="text-2xl font-extrabold mb-8">Order Summary</h2>
            <div className="flex items-center gap-5 p-5 bg-background-light dark:bg-white/5 rounded-[1.5rem] border border-border-subtle/40 dark:border-white/10 mb-8 max-w-full overflow-hidden">
                <div className="size-20 rounded-2xl overflow-hidden border border-border-subtle shrink-0 bg-white dark:bg-white/5">
                    <img
                        alt="Service"
                        className="w-full h-full object-cover"
                        src={image}
                    />
                </div>
                <div className="overflow-hidden">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">
                        {type}
                    </span>
                    <h4 className="font-extrabold text-lg mt-1 truncate">{booking.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{booking.location_summary || details.location || booking.description}</p>
                </div>
            </div>

            <div className="space-y-6 mb-8 flex-grow">
                {/* Specifics based on Type */}

                {type === 'transport' && (
                    <>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                                <div className="w-px h-full border-l-2 border-dashed border-border-subtle my-1"></div>
                            </div>
                            <div className="pb-1">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pickup</p>
                                <p className="font-bold text-sm text-charcoal dark:text-white">{details.origin}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-primary text-xl">sports_score</span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Drop-off</p>
                                <p className="font-bold text-sm text-charcoal dark:text-white">{details.destination}</p>
                            </div>
                        </div>
                    </>
                )}

                {type === 'flight' && (
                    <div className="bg-background-light dark:bg-white/5 p-5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">From</p>
                                <p className="font-black text-xl text-primary leading-none">{details.from}</p>
                            </div>
                            <div className="flex-1 px-4 flex flex-col items-center">
                                <div className="w-full h-px bg-dashed border-t border-dashed border-border-subtle relative">
                                    <span className="material-symbols-outlined absolute left-1/2 -top-3 -translate-x-1/2 text-primary bg-background-light dark:bg-[#1b1a18] px-1">rocket_launch</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">To</p>
                                <p className="font-black text-xl text-primary leading-none">{details.to}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border-subtle/20 flex justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Class</p>
                                <p className="font-bold text-xs">{details.class}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Passengers</p>
                                <p className="font-bold text-xs">{details.passengersCount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(type === 'wellness' || type === 'activity') && (
                    <div className="bg-background-light dark:bg-white/5 p-4 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2">Description</p>
                        <p className="font-medium text-sm text-charcoal dark:text-white leading-relaxed">
                            {booking.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Date</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                            <p className="font-bold text-xs">{formattedDate}</p>
                        </div>
                    </div>
                    {/* Time (mainly for Transport) */}
                    {type === 'transport' && (
                        <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Time</p>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                <p className="font-bold text-xs mb-0">
                                    {new Date(details.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Guests/Tickets for Others */}
                    {(type === 'wellness' || type === 'activity') && (
                        <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">
                                {type === 'wellness' ? 'Guests' : 'Tickets'}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">group</span>
                                <p className="font-bold text-xs mb-0">
                                    {booking.metadata?.guests || (booking.metadata?.tickets ? 'Multiple' : '1')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-4 pt-8 border-t border-border-subtle dark:border-white/10">
                <div className="pt-2 mt-2 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Payable</p>
                        <span className="text-4xl font-black text-charcoal dark:text-white tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-muted-foreground font-bold leading-tight">All taxes &<br />fees included</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
