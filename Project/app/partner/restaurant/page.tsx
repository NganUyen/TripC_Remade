"use client"

import { RestaurantPortal } from '@/components/partner/restaurant/RestaurantPortal'
import { PartnerAuthGuard } from '@/components/partner/PartnerAuthGuard'

export default function RestaurantPortalPage() {
    return (
        <PartnerAuthGuard portalName="Restaurant Portal">
            <RestaurantPortal />
        </PartnerAuthGuard>
    )
}
