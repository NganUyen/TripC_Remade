"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { SearchWithHistoryInput } from '@/components/common/SearchWithHistoryInput'
import { Activity } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'

interface ActivitiesHeroProps {
    allActivities: Activity[]
}

export function ActivitiesHero({ allActivities }: ActivitiesHeroProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get('category') || 'All'

    const categories = ['All', 'Theme Parks', 'Water Parks', 'Museums', 'Tours', 'Workshops']

    const handleSelectActivity = (activity: Activity) => {
        router.push(`/activities/${activity.id}`)
    }

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (category === 'All') {
            params.delete('category')
        } else {
            params.set('category', category)
        }
        router.push(`/activities?${params.toString()}`)
    }

    return (
        <section className="relative min-h-[500px] w-full flex flex-col items-center justify-center p-4">
            {/* Background Image & Overlay - Cinematic Contrast */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="w-full h-full"
                >
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2670&auto=format&fit=crop"
                        alt="Adventure Activities"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                {/* Studio Vignette Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 via-50% to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center mt-12 md:mt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-4xl md:text-5xl font-black mb-4 text-center drop-shadow-md"
                >
                    Explore & Experience
                </motion.h1>

                {/* FLOATING CONSOLE - Search & Pills Overlapping Bottom */}
                <div className="w-full relative z-20 flex flex-col items-center gap-6">

                    {/* Search Bar */}
                    <div className="w-full max-w-xl relative">
                        <SearchWithHistoryInput<Activity>
                            data={allActivities}
                            searchKeys={['title', 'location']}
                            category="activities"
                            placeholder="Search experiences, tours, and activities..."
                            onSelect={handleSelectActivity}
                            getDisplayValue={(item) => item.title}
                            renderResult={(item) => (
                                <div className="flex items-center gap-3">
                                    <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">{item.title}</div>
                                        <div className="text-xs text-slate-500">{item.location}</div>
                                    </div>
                                </div>
                            )}
                            className="shadow-xl"
                        />
                    </div>
                </div>

                    {/* Categories - Glass Pills */}
                    <div className="w-full overflow-x-auto no-scrollbar pb-4 px-4">
                        <div className="flex justify-center gap-3 w-fit min-w-full md:min-w-0">
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.05) }}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`whitespace-nowrap px-6 py-2.5 border rounded-full text-sm font-bold backdrop-blur-sm transition-all shadow-sm ${currentCategory === cat
                                            ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-[#FF5E1F] hover:border-[#FF5E1F]'
                                        }`}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            
    </section>
    )   

}
