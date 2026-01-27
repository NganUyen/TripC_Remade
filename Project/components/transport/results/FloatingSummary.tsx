"use client";

import Link from "next/link";

interface FloatingSummaryProps {
    route: any;
    origin: string;
    destination: string;
    date: string | null;
    passengers: string;
}

export function FloatingSummary({ route, origin, destination, date, passengers }: FloatingSummaryProps) {
    if (!route) return null;

    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
            <div className="bg-white/90 dark:bg-[#1b1a18]/90 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-full px-8 py-5 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">route</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Selected Route</p>
                            <p className="font-bold flex items-center gap-2">
                                {origin} <span className="material-symbols-outlined text-xs">arrow_forward</span> {destination}
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col border-l border-black/10 dark:border-white/10 pl-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Date & Passengers</p>
                        <p className="font-bold text-sm">{formattedDate} • {passengers} Pax</p>
                    </div>
                    <div className="hidden sm:flex flex-col border-l border-black/10 dark:border-white/10 pl-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Vehicle</p>
                        <p className="font-bold text-sm text-primary">{route.transport_providers?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Estimated Total</p>
                        <p className="text-2xl font-black text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price)}
                        </p>
                    </div>
                    <Link
                        href={`/transport/checkout?routeId=${route.id}&date=${date}&passengers=${passengers}`}
                        className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                    >
                        Continue
                    </Link>
                </div>
            </div>
        </div>
    );
}
