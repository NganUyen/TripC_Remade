"use client"

import React from 'react'
import { RestaurantHero } from '@/components/dining/RestaurantHero'
import { ReservationSidebar } from '@/components/dining/ReservationSidebar'
import { RestaurantContent } from '@/components/dining/RestaurantContent'
import { Footer } from '@/components/Footer'

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
    const venueId = params.id
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO - Immersive Image + Floating Info */}
            <RestaurantHero venueId={venueId} />

            {/* 2. MAIN LAYOUT - 2 Cols (Content + Sidebar) */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Content (Span 2) */}
                    <div className="lg:col-span-2">
                        <RestaurantContent />
                    </div>

                    {/* Right Sidebar (Sticky) */}
                    <div className="lg:col-span-1">
                        <ReservationSidebar venueId={venueId} />
                    </div>

                </div>
            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
