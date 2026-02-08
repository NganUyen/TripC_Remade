import { ReactNode } from 'react'

/**
 * Layout for Shop Partner Portal
 * Uses PartnerLayout with sidebar - no main site header/footer
 */
export default function ShopPartnerLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}
