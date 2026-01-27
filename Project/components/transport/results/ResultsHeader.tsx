"use client";

import Link from "next/link";

interface ResultsHeaderProps {
    origin: string;
    destination: string;
    date: string | null;
    time?: string | null;
    passengers: string;
    serviceType?: string | null;
    duration?: string | null;
}

export function ResultsHeader({ origin, destination, date, time, passengers, serviceType, duration }: ResultsHeaderProps) {
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const isHourly = serviceType === 'hourly';

    return (
        <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-border-subtle dark:border-[#333]">
            <div className="flex items-center gap-6">
                <Link href="/transport" className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold tracking-tight">
                        {isHourly ? `Charter from ${origin}` : `${origin} to ${destination}`}
                    </h1>
                    <p className="text-sm text-muted-foreground dark:text-[#a0a0a0]">
                        {formattedDate} • {time} • {passengers} Pass. {isHourly && `• ${duration}`}
                    </p>
                </div>
            </div>

        </header>
    );
}
