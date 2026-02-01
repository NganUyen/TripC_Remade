"use client"

import React, { useState } from 'react'
import { EventHero } from '@/components/events/EventHero'
import { EventFilters } from '@/components/events/EventFilters'
import { EventResults } from '@/components/events/EventResults'
import { Footer } from '@/components/Footer'

export default function EventsPage() {
    const [filters, setFilters] = useState<{
        city?: string
        category?: string
        search?: string
    }>({})

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO - Matching Shop/Entertainment Style */}
            <EventHero
                onSearch={(search) => setFilters(prev => ({ ...prev, search }))}
                onCategoryChange={(category) => setFilters(prev => ({ ...prev, category }))}
            />

            {/* 2. MAIN CONTENT AREA - Two Column Layout */}
            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-12 mb-24">

                {/* Header Summary */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">All Events</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar (Filter Container) */}
                    <div className="lg:col-span-1">
                        <EventFilters
                            currentFilters={filters}
                            onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                        />
                    </div>

                    {/* Results Grid (Result Container) */}
                    <div className="lg:col-span-3">
                        <EventResults {...filters} />
                    </div>

                </div>
            </div>

            {/* 3. FOOTER */}
            <Footer />
        </main>
    )
}
