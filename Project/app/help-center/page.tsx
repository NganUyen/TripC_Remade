"use client"

import { useState } from 'react'
import { HelpHero } from '@/components/help-center/HelpHero'
import { QuickActionGrid } from '@/components/help-center/QuickActionGrid'
import { FAQSection } from '@/components/help-center/FAQSection'
import { ArticleCarousel } from '@/components/help-center/ArticleCarousel'
import { SupportCTA } from '@/components/help-center/SupportCTA'
import { Footer } from '@/components/Footer'
import { HelpHeader } from '@/components/help-center/HelpHeader'

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <HelpHeader />

            <HelpHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {!searchQuery && <QuickActionGrid />}

            <FAQSection searchQuery={searchQuery} />

            <ArticleCarousel searchQuery={searchQuery} />

            <SupportCTA />

            <Footer />
        </main>
    )
}
