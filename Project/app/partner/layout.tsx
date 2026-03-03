"use client"

import { ReactNode } from 'react'
import { PartnerAuthGuard } from '@/components/partner/PartnerAuthGuard'

/**
 * Layout for Partner Portal
 * - Hides site header/footer for full-screen experience
 * - Enforces authentication for all partner routes
 */
export default function PartnerLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen">
            <PartnerAuthGuard>
                {children}
            </PartnerAuthGuard>
        </div>
    )
}
