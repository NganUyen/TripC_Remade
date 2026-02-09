"use client"

import React, { useState } from 'react'
import { VoucherHero } from '@/components/vouchers/VoucherHero'
import { BalanceBanner } from '@/components/vouchers/BalanceBanner'
import { MarketplaceList } from '@/components/vouchers/MarketplaceList'
import { WalletList } from '@/components/vouchers/WalletList'
import { Footer } from '@/components/Footer'

export default function VouchersPage() {
    const [view, setView] = useState<'buy' | 'wallet'>('buy')
    const [balance, setBalance] = useState(0)

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/v1/user/status')
                if (res.ok) {
                    const data = await res.json()
                    setBalance(data.tcent_balance || 0)
                } else if (res.status === 401) {
                    // User not authenticated - set balance to 0
                    setBalance(0)
                }
            } catch (error) {
                console.error('Failed to fetch user status', error)
            }
        }
        fetchUserData()

        // Listen for voucher redemption events to refresh balance
        const handleVoucherRedeemed = (event: CustomEvent) => {
            if (event.detail?.newBalance !== undefined) {
                setBalance(event.detail.newBalance)
            } else {
                // Fallback: refetch if newBalance not provided
                fetchUserData()
            }
        }

        window.addEventListener('voucher-redeemed', handleVoucherRedeemed as EventListener)
        return () => {
            window.removeEventListener('voucher-redeemed', handleVoucherRedeemed as EventListener)
        }
    }, [])

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] font-display text-[#1c140d] dark:text-white">

            {/* 1. HERO with Overlapping Controls */}
            <VoucherHero activeView={view} onViewChange={setView} />

            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pb-24 space-y-16">

                {/* 2. BALANCE BANNER */}
                <BalanceBanner balance={balance} />

                {/* 3. CONTENT AREA */}
                <section>
                    {view === 'buy' ? <MarketplaceList /> : <WalletList />}
                </section>

            </div>

            {/* 4. FOOTER */}
            <Footer />
        </main>
    )
}
