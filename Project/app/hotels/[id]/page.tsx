"use client"

import { HotelDetailHero } from '@/components/hotels/HotelDetailHero'
import { BookingSidebar, MobileBookingBar } from '@/components/hotels/BookingSidebar'
import { HotelContent } from '@/components/hotels/HotelContent'
import { Footer } from '@/components/Footer'

export default function HotelDetailPage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <HotelDetailHero />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-12 lg:pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8">
                        <HotelContent />
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 relative">
                        <BookingSidebar />
                    </div>
                </div>
            </div>

            <MobileBookingBar />
            <Footer />
        </main>
    )
}
