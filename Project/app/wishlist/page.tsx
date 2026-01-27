"use client"

import { WishlistHero } from '@/components/wishlist/WishlistHero'
import { EmptyState } from '@/components/wishlist/EmptyState'
import { TrendingCollections } from '@/components/wishlist/TrendingCollections'
import { Footer } from '@/components/Footer'

export default function WishlistPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <WishlistHero />

            {/* Empty State Card (Conditionally Rendered in real app) */}
            <EmptyState />

            {/* Suggested Collections (Immediate Visibility) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <TrendingCollections />
            </div>

            <Footer />
        </main>
    )
}
