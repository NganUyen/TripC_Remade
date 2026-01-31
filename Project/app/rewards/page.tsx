"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/rewards/TopBar'
import { BalanceHeader } from '@/components/rewards/BalanceHeader'
// import { PromoBanners } from '@/components/rewards/PromoBanners'
import { QuestCard } from '@/components/rewards/QuestCard'
import { StartEarningBar } from '@/components/rewards/StartEarningBar'
import { EarnList } from '@/components/rewards/EarnList'
import { InfoCard } from '@/components/rewards/InfoCard'
import { UseGrid } from '@/components/rewards/UseGrid'
import { DailyStreak } from '@/components/rewards/DailyStreak'
import { VoucherSection, VoucherDrawer } from '@/components/rewards/VoucherSection'
import { staggerContainer, Voucher } from '@/components/rewards/shared'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import SpinWheel from '@/components/gamification/SpinWheel'

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

                        {/* Lucky Day Spin Banner */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="cursor-pointer mb-6 rounded-[2rem] p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden flex items-center justify-between"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-2 py-0.5 rounded-lg bg-white/20 text-xs font-bold backdrop-blur-md">SPIN</span>
                                            <h3 className="text-xl font-bold">Lucky Day</h3>
                                        </div>
                                        <p className="text-indigo-100 text-sm">Your free spin is ready</p>
                                    </div>
                                    <button className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full font-bold text-sm hover:bg-white/30 transition-colors">
                                        Spin
                                    </button>

                                    {/* Background Decor */}
                                    <div className="absolute -right-10 -bottom-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                </motion.div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg bg-transparent border-none shadow-none p-0">
                                <SpinWheel />
                            </DialogContent>
                        </Dialog>

                        {/* <PromoBanners /> Removed as redundant */}
                        <QuestCard />
                        <DailyStreak />
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
