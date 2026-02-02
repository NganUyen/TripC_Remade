import React from 'react'
import { ActivitiesHero } from '@/components/activities/ActivitiesHero'
import { ActivityList } from '@/components/activities/ActivityList'
import { Footer } from '@/components/Footer'
import { getActivities } from '@/lib/actions/activities'
import { getServerWishlistIds } from '@/lib/actions/wishlist'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: {
        search?: string
        category?: string
    }
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
    const activities = await getActivities(searchParams.search, searchParams.category)
    const allActivities = await getActivities() // Fetch all for search autocomplete
    const wishlistIds = await getServerWishlistIds()

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO */}
            <ActivitiesHero allActivities={allActivities} />

            {/* 2. ACTIVITY POSTER GRID */}
            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-4 mb-24">
                <ActivityList activities={activities} wishlistIds={wishlistIds} />
            </div>

            {/* 3. FOOTER */}
            <Footer />
        </main>
    )
}
