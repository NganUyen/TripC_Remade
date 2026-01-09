"use client"

import { WellnessHero } from '@/components/wellness/WellnessHero'
import { MoodFilters } from '@/components/wellness/MoodFilters'
import { ExperienceList } from '@/components/wellness/ExperienceList'
import { Footer } from '@/components/Footer'

export default function WellnessPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <WellnessHero />

            <div className="relative z-10 -mt-20">
                <MoodFilters />
                <ExperienceList />
            </div>

            <Footer />
        </main>
    )
}
