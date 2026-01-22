import React, { useState, useMemo } from 'react'

export type DateRange = {
    from: Date | undefined
    to?: Date | undefined
}

interface CalendarProps {
    mode?: 'single' | 'range'
    selectedDate?: Date
    selectedRange?: DateRange
    onSelect?: (date: Date) => void
    onSelectRange?: (range: DateRange) => void
    minDate?: Date
    className?: string
}

export function SimpleCalendar({
    mode = 'single',
    selectedDate,
    selectedRange,
    onSelect,
    onSelectRange,
    minDate,
    className = ''
}: CalendarProps) {
    // Use current date if no selectedDate/Range, or parse
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Use state for the month being viewed
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (mode === 'single' && selectedDate) {
            return new Date(selectedDate)
        }
        if (mode === 'range' && selectedRange?.from) {
            return new Date(selectedRange.from)
        }
        return new Date()
    })

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const monthName = currentMonth.toLocaleString('default', { month: 'long' })

    const daysInMonth = useMemo(() => {
        return new Date(year, month + 1, 0).getDate()
    }, [year, month])

    const firstDayOfMonth = useMemo(() => {
        return new Date(year, month, 1).getDay()
    }, [year, month])

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1))
    }

    const handleDateClick = (day: number) => {
        const newDate = new Date(year, month, day)

        if (mode === 'single' && onSelect) {
            onSelect(newDate)
        } else if (mode === 'range' && onSelectRange) {
            const currentRange = selectedRange || { from: undefined, to: undefined }

            if (currentRange.from && !currentRange.to) {
                if (newDate > currentRange.from) {
                    onSelectRange({ from: currentRange.from, to: newDate })
                } else {
                    // New start date
                    onSelectRange({ from: newDate, to: undefined })
                }
            } else {
                // Start new range
                onSelectRange({ from: newDate, to: undefined })
            }
        }
    }

    const isSelected = (day: number) => {
        const target = new Date(year, month, day)

        if (mode === 'single') {
            if (!selectedDate) return false
            const selected = new Date(selectedDate)
            return (
                selected.getDate() === day &&
                selected.getMonth() === month &&
                selected.getFullYear() === year
            )
        } else {
            // Range mode
            if (!selectedRange?.from) return false
            const from = new Date(selectedRange.from)
            if (
                from.getDate() === day &&
                from.getMonth() === month &&
                from.getFullYear() === year
            ) return true

            if (selectedRange.to) {
                const to = new Date(selectedRange.to)
                if (
                    to.getDate() === day &&
                    to.getMonth() === month &&
                    to.getFullYear() === year
                ) return true
            }
            return false
        }
    }

    const isInRange = (day: number) => {
        if (mode !== 'range' || !selectedRange?.from || !selectedRange?.to) return false
        const target = new Date(year, month, day)
        return target > selectedRange.from && target < selectedRange.to
    }

    const isDisabled = (day: number) => {
        if (!minDate) return false
        const dateToCheck = new Date(year, month, day)
        const min = new Date(minDate)
        min.setHours(0, 0, 0, 0)
        return dateToCheck < min
    }

    return (
        <div className={`w-[320px] p-2 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select Date</h4>
                <div className="flex gap-2 text-slate-900 dark:text-white">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                        <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <span className="text-sm font-medium">
                        {monthName} {year}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                        <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 font-medium">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Empty cells for previous month */}
                {[...Array(firstDayOfMonth)].map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1
                    const selected = isSelected(day)
                    const inRange = isInRange(day)
                    const disabled = isDisabled(day)

                    return (
                        <button
                            key={day}
                            onClick={() => !disabled && handleDateClick(day)}
                            disabled={disabled}
                            className={`
                    aspect-square flex items-center justify-center transition-all
                    ${selected
                                    ? 'bg-blue-500 text-white font-bold shadow-md rounded-full z-10'
                                    : inRange
                                        ? 'bg-blue-50 text-blue-600 rounded-none' // Connected range
                                        : disabled
                                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-full'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full'
                                }
                `}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
