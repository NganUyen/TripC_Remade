"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { WalletSection } from '@/components/profile/WalletSection'
import { ActivityGrid } from '@/components/profile/ActivityGrid'
import { GrowthSection, SettingsList } from '@/components/profile/SettingsSection'
import { Footer } from '@/components/Footer'

export default function ProfilePage() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const autoEdit = searchParams.get('action') === 'edit-profile'

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/v1/user/profile')
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* Dashboard Container */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="max-w-5xl mx-auto">
                    <ProfileHero
                        profile={profile}
                        initialEditMode={autoEdit}
                        onProfileUpdate={(newProfile) => setProfile(newProfile)}
                    />
                    <WalletSection profile={profile} />
                    <ActivityGrid />
                    <GrowthSection />
                    <SettingsList />
                </div>
            </div>

            <Footer />
        </main>
    )
}
