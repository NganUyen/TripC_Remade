"use client";

import { cn } from "@/lib/utils";

interface DateSelectorProps {
    startDate: string | null; // The first date to show in the range
    selectedDate: string | null; // The currently selected/active date
    onDateChange: (date: string) => void;
}

export function DateSelector({ startDate, selectedDate, onDateChange }: DateSelectorProps) {
    // Generate dates starting from startDate (or today if null)
    const baseDate = startDate ? new Date(startDate) : new Date();
    const selectedDateStr = selectedDate || startDate || new Date().toISOString().split('T')[0];

    // Create an array of 7 days starting from baseDate
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        const isoDate = d.toISOString().split('T')[0];
        return {
            dateObj: d,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            monthDay: d.toLocaleDateString('en-US', { day: 'numeric' }),
            month: d.toLocaleDateString('en-US', { month: 'short' }),
            isoDate: isoDate,
            active: isoDate === selectedDateStr
        };
    });

    return (
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-6 px-4">
            {dates.map((item, index) => (
                <button
                    key={index}
                    onClick={() => onDateChange(item.isoDate)}
                    className={cn(
                        "flex h-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-6 cursor-pointer transition-all hover:scale-105 active:scale-95",
                        item.active
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-white/5 border border-border-subtle dark:border-[#333] hover:border-primary/50"
                    )}
                >
                    <p className={cn("text-xs font-bold tracking-widest", item.active ? "opacity-80" : "text-muted")}>
                        {item.day}
                    </p>
                    <p className="text-xl font-bold">{item.month} {item.monthDay}</p>
                </button>
            ))}
        </div>
    );
}

