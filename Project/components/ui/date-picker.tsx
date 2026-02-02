"use client";

import * as React from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years"; // usage of buttons not supported in this version
  fromYear?: number;
  toYear?: number;
  disabledDates?: (date: Date) => boolean; // Allow custom disabled logic
  variant?: "default" | "outline" | "ghost" | "inline"; // Button variant
}

export function DatePicker({
  date,
  onSelect,
  label,
  placeholder = "Select Date",
  minDate,
  maxDate, // Added maxDate support (e.g. for DOB)
  className,
  captionLayout,
  fromYear,
  toYear,
  disabledDates: customDisabledDates,
  variant = "outline", // Default to outline as per user request for compact look
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Default Disable logic (if no custom logic provided)
  const defaultDisabledDates = (currentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (minDate) {
      minDate.setHours(0, 0, 0, 0);
      if (currentDate < minDate) return true;
    }

    // If maxDate is provided (e.g. for DOB, no future dates)
    if (maxDate) {
      maxDate.setHours(23, 59, 59, 999);
      if (currentDate > maxDate) return true;
    } else if (!minDate && !customDisabledDates) {
      // Default behavior if nothing specified: disable past dates (for flights)
      // But if maxDate is specified, we assume it's for DOB or something else, so we don't auto-disable past.
      // Let's stick to: if minDate is NOT set, and this is seemingly a flight picker, we disable past.
      // BUT for DOB, minDate is usually not set (or set to 1900), so we shouldn't force disable past.
      // Safest: Only disable past if minDate is provided OR context implies it.
      // Actually, existing usage relied on "disable past".
      // Let's replicate old logic ONLY if minDate is provided or strictly for flight search?
      // Better: Let the consumer decide.
      return currentDate < today;
    }

    return false;
  };

  const isDateDisabled = customDisabledDates || defaultDisabledDates;

  // Variant logic
  const isInline = variant === "inline";
  const buttonVariant =
    isInline || variant === "ghost"
      ? "ghost"
      : (variant as "default" | "outline" | "ghost");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            className={cn(
              "w-full justify-between text-left font-normal",
              !date && "text-muted-foreground",
              isInline &&
                "bg-transparent border-none shadow-none p-0 h-auto hover:bg-transparent justify-start gap-2",
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isInline
                    ? "text-slate-400 group-hover:text-[#FF5E1F]"
                    : "opacity-50",
                )}
              />
              <span
                className={cn(
                  "truncate",
                  isInline &&
                    "text-base font-bold text-slate-900 dark:text-white",
                )}
              >
                {date ? format(date, "dd/MM/yyyy") : placeholder}
              </span>
            </div>
            {!isInline && (
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onSelect(newDate);
              setOpen(false);
            }}
            disabled={isDateDisabled}
            initialFocus
            captionLayout={captionLayout}
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
