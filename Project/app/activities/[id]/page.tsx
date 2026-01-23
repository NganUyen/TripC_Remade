"use client"

import { ActivitiesHeaderPanel } from '@/components/activities/ActivitiesHeaderPanel'
import { ActivitiesContent } from '@/components/activities/ActivitiesContent'
import { ActivitiesDetails } from '@/components/activities/ActivitiesDetails'
import { ActivityBookingWidget, MobileActivityBookingBar } from '@/components/activities/ActivityBookingWidget'
import { Footer } from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getActivityById } from '@/components/activities/mockData'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'reviews'>('overview')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Get the activity item by ID
    const item = getActivityById(params.id)

    // If item not found, show 404
    if (!item) {
        return notFound()
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            {/* 0. NAVIGATION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Link href="/activities" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Activities
                </Link>
            </div>

            {/* 1. HEADER PANEL */}
            <ActivitiesHeaderPanel item={item} />

            {/* 2. TABS */}
            <div className="sticky top-0 z-40 bg-[#fcfaf8]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {['overview', 'details', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                                    activeTab === tab
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8">
                        {activeTab === 'overview' && <ActivitiesContent item={item} />}
                        {activeTab === 'details' && <ActivitiesDetails item={item} />}
                        {activeTab === 'reviews' && (
                            <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <p>Reviews coming soon...</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 relative">
                        <ActivityBookingWidget item={item} />
                    </div>
                </div>
            </div>

            <MobileActivityBookingBar item={item} />
            <Footer />
        </main>
    )
}
