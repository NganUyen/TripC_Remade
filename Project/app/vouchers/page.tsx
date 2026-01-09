"use client"

import React from 'react'
import { VoucherHero } from '@/components/vouchers/VoucherHero'
import { BalanceBanner } from '@/components/vouchers/BalanceBanner'
import { VoucherEmptyState } from '@/components/vouchers/VoucherEmptyState'
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
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">Gift Cards & Vouchers</h2>
                        <span className="text-slate-400 font-medium text-sm">Showing 0 results</span>
                    </div>

                    {/* Empty State Container */}
                    <VoucherEmptyState />
                </section>

            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
