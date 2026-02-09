"use client"

import React, { ReactNode, Suspense } from 'react'
import { PartnerSidebar, PartnerSidebarSkeleton } from './PartnerSidebar'
import { useUser } from '@clerk/nextjs'
import { usePartnerStore } from '@/store/usePartnerStore'

interface PartnerLayoutProps {
    children: ReactNode
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
    const { isLoaded: clerkLoaded } = useUser()
    const { isLoading: partnerLoading } = usePartnerStore()

    const isLoading = !clerkLoaded || partnerLoading

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex">
            {/* Always show sidebar or its skeleton */}
            {isLoading ? <PartnerSidebarSkeleton /> : <PartnerSidebar />}

            {/* Main content area - offset by sidebar width (defaults to 64 = w-64) */}
            <main className="flex-1 ml-64 transition-all duration-300">
                <div className="p-6 lg:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
