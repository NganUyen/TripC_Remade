"use client"

import React from 'react'
import { VoucherHero } from '@/components/vouchers/VoucherHero'
import { BalanceBanner } from '@/components/vouchers/BalanceBanner'
import { MarketplaceList } from '@/components/vouchers/MarketplaceList'
import { Footer } from '@/components/Footer'

export default function VouchersPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO with Overlapping Controls */}
            <VoucherHero />

            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pb-24 space-y-16">

                {/* 2. BALANCE BANNER */}
                <BalanceBanner />

                {/* 3. CONTENT AREA */}
                <section>
                    <MarketplaceList />
                </section>

            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
