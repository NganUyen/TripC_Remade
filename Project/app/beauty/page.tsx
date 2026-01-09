"use client"

import { BeautyHero } from '@/components/beauty/BeautyHero'
import { BeautyList } from '@/components/beauty/BeautyList'
import { BeautyNearYou } from '@/components/beauty/BeautyNearYou'
import { Footer } from '@/components/Footer'

export default function BeautyPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* Hero Section */}
            <BeautyHero />

            <div className="space-y-20 pb-20">
                {/* Top Rated / Lookbook Cards */}
                <BeautyList />

                {/* Near You Section */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <BeautyNearYou />
                </div>
            </div>

            <Footer />
        </main>
    )
}
