"use client"

import { HotelHero } from '@/components/hotels/HotelHero'
import { HotelFilters } from '@/components/hotels/HotelFilters'
import { HotelList } from '@/components/hotels/HotelList'
import { Footer } from '@/components/Footer'
import { Map, List } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HotelsPage() {
    const [isMapView, setIsMapView] = useState(false)

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <HotelHero />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-20 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Hidden on mobile, can add a mobile drawer logic later */}
                    <div className="hidden lg:block">
                        <HotelFilters />
                    </div>

                    {/* Main Content */}
                    <HotelList />
                </div>
            </div>

            {/* Floating Map Toggle */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => setIsMapView(!isMapView)}
                    className="flex items-center gap-2 pl-4 pr-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all font-bold"
                >
                    {isMapView ? (
                        <>
                            <List className="w-5 h-5" />
                            Show List
                        </>
                    ) : (
                        <>
                            <Map className="w-5 h-5" />
                            Show Map
                        </>
                    )}
                </button>
            </div>

            <Footer />
        </main>
    )
}
