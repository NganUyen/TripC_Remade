"use client"

import React from 'react'
import { ShopHero } from '@/components/shop/ShopHero'
import { MarketplaceActions } from '@/components/shop/MarketplaceActions'
import { VoucherStrip } from '@/components/shop/VoucherStrip'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { Footer } from '@/components/Footer'

export default function ShopPage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO - Search & Categories */}
            <ShopHero />

            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 mt-8 md:mt-12 space-y-16">

                {/* 2. ACTIONS - Vouchers & Cart */}
                <MarketplaceActions />

                {/* 3. VOUCHERS - Horizontal Scroll */}
                <VoucherStrip />

                {/* 4. PRODUCTS - Grid */}
                <ProductGrid />

            </div>

            {/* 5. FOOTER */}
            <Footer />
        </main>
    )
}
