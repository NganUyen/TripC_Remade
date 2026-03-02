"use client"

import { HotelPortal } from '@/components/partner/hotel/HotelPortal'
import { PartnerAuthGuard } from '@/components/partner/PartnerAuthGuard'

export default function HotelPortalPage() {
    return (
        <PartnerAuthGuard portalName="Hotel Portal">
            <HotelPortal />
        </PartnerAuthGuard>
    )
}
