"use client"

import React, { useState } from 'react'
import { SlidersHorizontal, Check } from 'lucide-react'
import type { EventCategory } from '@/lib/events/types'

interface EventFiltersProps {
    currentFilters?: {
        category?: string
        city?: string
        date_from?: string
        date_to?: string
    }
    onFilterChange?: (filters: {
        category?: string
        city?: string
        date_from?: string
        date_to?: string
    }) => void
}

const CATEGORIES: { value: EventCategory | ''; label: string }[] = [
    { value: '', label: 'All Categories' },
    { value: 'concert', label: 'Concerts' },
    { value: 'festival', label: 'Festivals' },
    { value: 'sports', label: 'Sports' },
    { value: 'theater', label: 'Theater & Arts' },
    { value: 'conference', label: 'Conferences' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'exhibition', label: 'Exhibitions' },
]

const CITIES = [
    { value: '', label: 'All Cities' },
    { value: 'Ho Chi Minh City', label: 'Ho Chi Minh City' },
    { value: 'Hanoi', label: 'Hanoi' },
    { value: 'Da Nang', label: 'Da Nang' },
    { value: 'Nha Trang', label: 'Nha Trang' },
    { value: 'Hue', label: 'Hue' },
]

const DATE_OPTIONS = [
    { value: '', label: 'Any Date' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
]

export function EventFilters({ onFilterChange, currentFilters }: EventFiltersProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(currentFilters?.category || '')
    const [selectedCity, setSelectedCity] = useState<string>(currentFilters?.city || '')
    const [selectedDate, setSelectedDate] = useState<string>('')

    // Sync with parent changes
    React.useEffect(() => {
        if (currentFilters?.category !== undefined) setSelectedCategory(currentFilters.category)
        if (currentFilters?.city !== undefined) setSelectedCity(currentFilters.city)
    }, [currentFilters])

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        onFilterChange?.({ category: category || undefined })
    }

    const handleCityChange = (city: string) => {
        setSelectedCity(city)
        onFilterChange?.({ city: city || undefined })
    }

    const handleDateChange = (dateOption: string) => {
        setSelectedDate(dateOption)

        // Calculate date ranges
        const today = new Date()
        let date_from: string | undefined
        let date_to: string | undefined

        switch (dateOption) {
            case 'today':
                date_from = today.toISOString().split('T')[0]
                date_to = date_from
                break
            case 'tomorrow':
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                date_from = tomorrow.toISOString().split('T')[0]
                date_to = date_from
                break
            case 'this-week':
                date_from = today.toISOString().split('T')[0]
                const endOfWeek = new Date(today)
                endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
                date_to = endOfWeek.toISOString().split('T')[0]
                break
            case 'this-month':
                date_from = today.toISOString().split('T')[0]
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                date_to = endOfMonth.toISOString().split('T')[0]
                break
        }

        onFilterChange?.({ date_from, date_to })
    }

    const handleReset = () => {
        setSelectedCategory('')
        setSelectedCity('')
        setSelectedDate('')
        onFilterChange?.({
            category: '',
            city: '',
            date_from: undefined,
            date_to: undefined
        })
    }

    return (
        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" /> Filters
                </h3>
                <button
                    onClick={handleReset}
                    className="text-sm text-[#FF5E1F] font-bold hover:underline"
                >
                    Reset
                </button>
            </div>

            <div className="space-y-8">
                {/* Category Filter */}
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                        Category
                    </h4>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <label
                                key={cat.value}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => handleCategoryChange(cat.value)}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 transition-all duration-200
                                    flex items-center justify-center
                                    ${selectedCategory === cat.value
                                        ? 'border-[#FF5E1F] bg-[#FF5E1F]'
                                        : 'border-slate-300 dark:border-zinc-600 group-hover:border-[#FF5E1F]'
                                    }
                                `}>
                                    {selectedCategory === cat.value && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <span className={`
                                    font-medium transition-colors
                                    ${selectedCategory === cat.value
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                    }
                                `}>
                                    {cat.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* City Filter */}
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                        City
                    </h4>
                    <div className="space-y-2">
                        {CITIES.map((city) => (
                            <label
                                key={city.value}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => handleCityChange(city.value)}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 transition-all duration-200
                                    flex items-center justify-center
                                    ${selectedCity === city.value
                                        ? 'border-[#FF5E1F] bg-[#FF5E1F]'
                                        : 'border-slate-300 dark:border-zinc-600 group-hover:border-[#FF5E1F]'
                                    }
                                `}>
                                    {selectedCity === city.value && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <span className={`
                                    font-medium transition-colors
                                    ${selectedCity === city.value
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                    }
                                `}>
                                    {city.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Date Filter */}
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                        Date
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {DATE_OPTIONS.map((date) => (
                            <button
                                key={date.value}
                                onClick={() => handleDateChange(date.value)}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                    ${selectedDate === date.value
                                        ? 'bg-[#FF5E1F] text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                    }
                                `}
                            >
                                {date.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
