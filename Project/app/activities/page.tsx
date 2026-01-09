"use client"

import React from 'react'
import { ActivitiesHero } from '@/components/activities/ActivitiesHero'
import { ActivityList } from '@/components/activities/ActivityList'
import { Footer } from '@/components/Footer'

export default function ActivitiesPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO */}
            <ActivitiesHero />

            {/* 2. ACTIVITY POSTER GRID */}
            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-12 mb-24">
                <ActivityList />
            </div>

            {/* 3. FOOTER */}
            <Footer />
        </main>
    )
}
