"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/rewards/TopBar'
import { BalanceHeader } from '@/components/rewards/BalanceHeader'
import { PromoBanners } from '@/components/rewards/PromoBanners'
import { QuestCard } from '@/components/rewards/QuestCard'
import { StartEarningBar } from '@/components/rewards/StartEarningBar'
import { EarnList } from '@/components/rewards/EarnList'
import { InfoCard } from '@/components/rewards/InfoCard'
import { UseGrid } from '@/components/rewards/UseGrid'
import { VoucherSection, VoucherDrawer } from '@/components/rewards/VoucherSection'
import { staggerContainer, Voucher } from '@/components/rewards/shared'

export default function RewardsPage() {
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
    const [userData, setUserData] = useState<{
        tcent_balance: number
        membership_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
        tcent_pending: number
    } | null>(null)

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/v1/user/status')
                if (res.ok) {
                    const data = await res.json()
                    setUserData(data)
                } else if (res.status === 401) {
                    // User not authenticated - set null or default data
                    setUserData(null)
                }
            } catch (error) {
                console.error('Failed to fetch user status', error)
            }
        }
        fetchUserData()
    }, [])

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <TopBar />

            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Main Content */}
                    <div className="lg:col-span-8">
                        <BalanceHeader
                            tcent_balance={userData?.tcent_balance ?? 0}
                            membership_tier={userData?.membership_tier ?? 'BRONZE'}
                            tcent_pending={userData?.tcent_pending ?? 0}
                        />
                        <PromoBanners />
                        <QuestCard />
                        <StartEarningBar />
                        <EarnList />
                    </div>

                    {/* Right Rail */}
                    <div className="lg:col-span-4 space-y-8">
                        <InfoCard />
                        <UseGrid />
                        <VoucherSection onSelect={setSelectedVoucher} />
                    </div>
                </div>
            </motion.div>

            <VoucherDrawer
                voucher={selectedVoucher}
                onClose={() => setSelectedVoucher(null)}
            />
        </main>
    )
}
