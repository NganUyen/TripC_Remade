"use client"

import React from 'react'
import { DiningHero } from '@/components/dining/DiningHero'
import { DiningBento } from '@/components/dining/DiningBento'
import { RestaurantList } from '@/components/dining/RestaurantList'
import { Footer } from '@/components/Footer'

export default function DiningPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO - Masked with Floating Search Pill */}
            <DiningHero />

            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-12 space-y-20 mb-24">

                {/* 2. COLLECTIONS */}
                <DiningBento />

                {/* 3. RESTAURANT LIST */}
                <RestaurantList />

            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
