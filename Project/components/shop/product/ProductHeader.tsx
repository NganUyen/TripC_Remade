"use client"

import { MapPin, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { BadgePill } from '@/components/ui/BadgePill'

interface ProductHeaderProps {
    title: string
    location: string
    rating: string
    reviews: string
    highlights: { icon: any, text: string }[]
}

export function ProductHeader({ title, location, rating, reviews, highlights }: ProductHeaderProps) {
    return (
        <div className="space-y-6 pt-4 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#FF5E1F] font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    {location}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                    {title}
                </h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-lg">{rating}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 font-medium">
                        {reviews} verified reviews
                    </span>
                </div>
            </div>

            {/* Highlights Row */}
            <div className="flex flex-wrap gap-3">
                {highlights.map((highlight, index) => (
                    <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium"
                    >
                        <highlight.icon className="w-4 h-4" strokeWidth={1.5} />
                        {highlight.text}
                    </div>
                ))}
            </div>
        </div>
    )
}
