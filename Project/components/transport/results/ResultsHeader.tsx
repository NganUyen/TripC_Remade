"use client";

import Link from "next/link";

export function ResultsHeader() {
    return (
        <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-border-subtle dark:border-[#333]">
            <div className="flex items-center gap-6">
                <Link href="/transport" className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold tracking-tight">Paris to Nice</h1>
                    <p className="text-sm text-muted dark:text-[#a0a0a0]">Oct 12, 2023 • 2 Passengers</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="size-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">trip_origin</span>
                </div>
                <h2 className="text-xl font-bold tracking-tighter">TripC</h2>
            </div>
        </header>
    );
}
