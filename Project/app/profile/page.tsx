"use client"

import { ProfileHero } from '@/components/profile/ProfileHero'
import { WalletSection } from '@/components/profile/WalletSection'
import { ActivityGrid } from '@/components/profile/ActivityGrid'
import { GrowthSection, SettingsList } from '@/components/profile/SettingsSection'
import { Footer } from '@/components/Footer'

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* Dashboard Container */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="max-w-5xl mx-auto">
                    <ProfileHero />
                    <WalletSection />
                    <ActivityGrid />
                    <GrowthSection />
                    <SettingsList />
                </div>
            </div>

            <Footer />
        </main>
    )
}
