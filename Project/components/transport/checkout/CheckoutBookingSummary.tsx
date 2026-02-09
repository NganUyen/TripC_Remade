"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CheckoutBookingSummaryProps {
    route: any;
    date: string | null;
    passengers: string;
    expiresAt?: string;
    voucherCode?: string;
    discountAmount?: number;
    onApplyVoucher?: (code: string) => Promise<void>;
    isApplyingVoucher?: boolean;
}

export function CheckoutBookingSummary({ route, date, passengers, expiresAt, voucherCode, discountAmount = 0, onApplyVoucher, isApplyingVoucher }: CheckoutBookingSummaryProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [inputCode, setInputCode] = useState(voucherCode || "");

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

    if (!route) return null;

    const baseFare = route.price;
    const taxes = baseFare * 0.1; // 10% tax assumption
    const subTotal = baseFare + taxes;
    const total = Math.max(0, subTotal - discountAmount);
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    const handleVoucherSubmit = () => {
        if (onApplyVoucher && inputCode) {
            onApplyVoucher(inputCode);
        }
    };

    return (
        <div className="card-shell w-full lg:w-[460px] p-8 md:p-10 flex flex-col bg-white dark:bg-[#1b1a18] border border-border-subtle dark:border-[#333] rounded-card shadow-sm dark:shadow-none sticky top-24">

            {/* Timer Banner */}
            {expiresAt && timeLeft !== "EXPIRED" && (
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

            <h2 className="text-2xl font-extrabold mb-8">Booking Summary</h2>
            <div className="flex items-center gap-5 p-5 bg-background-light dark:bg-white/5 rounded-[1.5rem] border border-border-subtle/40 dark:border-white/10 mb-8">
                <div className="size-20 rounded-2xl overflow-hidden border border-border-subtle shrink-0 bg-white dark:bg-white/5">
                    <img
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                        src={route.images?.[0] || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop"}
                    />
                </div>
                <div>
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">Selected Vehicle</span>
                    <h4 className="font-extrabold text-lg mt-1">{route.transport_providers?.name}</h4>
                    <p className="text-xs text-muted-foreground">{route.vehicle_type} • {route.type}</p>
                </div>
            </div>
            <div className="space-y-6 mb-8 flex-grow">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                        <div className="w-px h-full border-l-2 border-dashed border-border-subtle my-1"></div>
                    </div>
                    <div className="pb-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pickup</p>
                        <p className="font-bold text-sm text-charcoal dark:text-white">{route.origin}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-xl">sports_score</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Drop-off</p>
                        <p className="font-bold text-sm text-charcoal dark:text-white">{route.destination}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Date</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                            <p className="font-bold text-xs">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Time</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                            <p className="font-bold text-xs mb-0">
                                {new Date(route.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Voucher Input */}
                <div className="pt-4 border-t border-border-subtle dark:border-white/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Voucher Code</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-white dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                            placeholder="Enter code"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                        />
                        <button
                            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={handleVoucherSubmit}
                            disabled={!inputCode || isApplyingVoucher}
                        >
                            {isApplyingVoucher ? '...' : 'APPLY'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-border-subtle dark:border-white/10">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Base Fare (x{passengers})</span>
                    <span className="font-bold text-charcoal dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(baseFare)}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Service Fees & Taxes (10%)</span>
                    <span className="font-bold text-charcoal dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxes)}
                    </span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-500">
                        <span className="font-bold">Discount Applied</span>
                        <span className="font-bold">
                            -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                        </span>
                    </div>
                )}

                <div className="pt-6 mt-2 flex justify-between items-end">
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
