import { ReactNode } from 'react'

/**
 * Layout riêng cho Partner Portal
 * Ẩn Header và CategorySlider để có full-screen experience
 */
export default function PartnerLayout({
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
