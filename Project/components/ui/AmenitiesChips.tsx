"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Droplets, Utensils, MoreHorizontal, Check } from 'lucide-react'

// Map common amenity names to Lucide icons
const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />
    if (lower.includes('pool') || lower.includes('droplets')) return <Droplets className="w-3 h-3" />
    if (lower.includes('breakfast') || lower.includes('food') || lower.includes('utensils')) return <Utensils className="w-3 h-3" />
    return <Check className="w-3 h-3" />
}

interface AmenitiesChipsProps {
    items: string[]
    maxVisible?: number
}

export function AmenitiesChips({ items, maxVisible = 3 }: AmenitiesChipsProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Normalize: ensure we don't crash if items is empty
    if (!items || items.length === 0) return null

    const visibleItems = items.slice(0, maxVisible)
    const hiddenItems = items.slice(maxVisible)
    const hasHidden = hiddenItems.length > 0
    const moreCount = hiddenItems.length

    return (
        <div className="flex flex-wrap gap-2 w-full">
            {visibleItems.map((item, i) => (
                <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                >
                    <span className="text-slate-400">{getAmenityIcon(item)}</span>
                    <span className="truncate max-w-[100px]">{item}</span>
                </div>
            ))}

            {hasHidden && (
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsOpen(!isOpen)
                        }}
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span>+{moreCount}</span>
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 flex flex-col gap-2"
                            >
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Other Amenities</div>
                                {hiddenItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <div className="size-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        {item}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
