"use client"

import { useState, useEffect } from 'react'
import { BeautyHero } from '@/components/beauty/BeautyHero'
import { BeautyList } from '@/components/beauty/BeautyList'
import { BeautyCategories } from '@/components/beauty/BeautyCategories'
import { BeautyNearYou } from '@/components/beauty/BeautyNearYou'
import { Footer } from '@/components/Footer'
import type { VenueSearchParams } from '@/lib/beauty/types'

export default function BeautyPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [locationQuery, setLocationQuery] = useState('')
    const [appliedFilters, setAppliedFilters] = useState<VenueSearchParams | null>(null)

    const handleSearch = () => {
        const hasSearch = searchQuery.trim().length > 0
        const hasLocation = locationQuery.trim().length > 0
        if (!hasSearch && !hasLocation) {
            setAppliedFilters(null)
            return
        }
        setAppliedFilters({
            search: hasSearch ? searchQuery.trim() : undefined,
            city: hasLocation ? locationQuery.trim() : undefined,
            limit: 20,
            offset: 0,
        })
    }

    const handleCategorySelect = (categoryId: string) => {
        setAppliedFilters((prev) => ({
            ...prev ?? { limit: 20, offset: 0 },
            categories: [categoryId],
            search: undefined,
            city: prev?.city,
        }))
    }

    const clearFilters = () => {
        setSearchQuery('')
        setLocationQuery('')
        setAppliedFilters(null)
    }

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <BeautyHero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                locationQuery={locationQuery}
                setLocationQuery={setLocationQuery}
                onSearch={handleSearch}
                onCategorySelect={handleCategorySelect}
                clearFilters={clearFilters}
                hasActiveFilters={!!appliedFilters}
            />

            <div className="space-y-20 pb-20">
                <BeautyList appliedFilters={appliedFilters} />

                <BeautyCategories
                    onCategorySelect={handleCategorySelect}
                    selectedCategoryId={appliedFilters?.categories?.[0]}
                />

                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <BeautyNearYou />
                </div>
            </div>

            <Footer />
        </main>
    )
}
