"use client";

import { cn } from "@/lib/utils";

export function DateSelector() {
    const dates = [
        { day: "Mon", date: "12 Oct", active: true },
        { day: "Tue", date: "13 Oct", active: false },
        { day: "Wed", date: "14 Oct", active: false },
        { day: "Thu", date: "15 Oct", active: false },
        { day: "Fri", date: "16 Oct", active: false },
        { day: "Sat", date: "17 Oct", active: false },
        { day: "Sun", date: "18 Oct", active: false },
    ];

    return (
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-6 px-4">
            {dates.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex h-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-6 cursor-pointer transition-all",
                        item.active
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-white/5 border border-border-subtle dark:border-[#333] hover:border-primary/50"
                    )}
                >
                    <p className={cn("text-xs font-bold uppercase tracking-widest", item.active ? "opacity-80" : "text-muted")}>
                        {item.day}
                    </p>
                    <p className="text-xl font-bold">{item.date}</p>
                </div>
            ))}
        </div>
    );
}
