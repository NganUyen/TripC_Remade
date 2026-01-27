import React from 'react'

interface CounterInputProps {
    label: string
    subLabel?: string
    value: number
    onChange: (newValue: number) => void
    min?: number
    max?: number
    className?: string
}

export function CounterInput({
    label,
    subLabel,
    value,
    onChange,
    min = 0,
    max = 99,
    className = '',
}: CounterInputProps) {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1)
        }
    }

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1)
        }
    }

    return (
        <div className={`flex items-center justify-between py-3 ${className}`}>
            <div>
                <div className="text-slate-900 dark:text-white font-bold text-sm">
                    {label}
                </div>
                {subLabel && (
                    <div className="text-slate-500 dark:text-white/40 text-xs">
                        {subLabel}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className={`w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center transition-colors 
            ${value <= min
                            ? 'text-slate-300 dark:text-white/20 cursor-not-allowed'
                            : 'text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                >
                    -
                </button>
                <span className="text-slate-900 dark:text-white font-bold w-4 text-center">
                    {value}
                </span>
                <button
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className={`w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center transition-colors
            ${value >= max
                            ? 'text-slate-300 dark:text-white/20 cursor-not-allowed'
                            : 'text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                >
                    +
                </button>
            </div>
        </div>
    )
}
