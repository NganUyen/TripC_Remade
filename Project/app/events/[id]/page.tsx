"use client"

import { EventDetailHero } from '@/components/events/EventDetailHero'
import { EventBookingSidebar, EventMobileBookingBar } from '@/components/events/EventBookingSidebar'
import { EventContent } from '@/components/events/EventContent'
import { Footer } from '@/components/Footer'

export default function EventDetailPage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* 1. HERO SECTION */}
            <EventDetailHero />

            {/* 2. MAIN CONTENT LAYOUT */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-12 lg:pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (Left) - 8 Cols */}
                    <div className="lg:col-span-8">
                        <EventContent />
                    </div>

                    {/* Sidebar (Right) - 4 Cols */}
                    <div className="lg:col-span-4 relative">
                        <EventBookingSidebar />
                    </div>
                </div>
            </div>

            {/* 3. MOBILE FIXED BAR */}
            <EventMobileBookingBar />

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
