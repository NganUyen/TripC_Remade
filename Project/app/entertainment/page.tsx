"use client"

import React from 'react'
import { EntertainmentHero } from '@/components/entertainment/EntertainmentHero'
import { TrendingBento } from '@/components/entertainment/TrendingBento'
import { TicketList } from '@/components/entertainment/TicketList'
import { Footer } from '@/components/Footer' // Assuming named export from previous fix

export default function EntertainmentPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO */}
            <EntertainmentHero />

            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-12 space-y-20">

                {/* 2. TRENDING BENTO GRID */}
                <TrendingBento />

                {/* 3. HOT TICKETS */}
                <TicketList />

            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
