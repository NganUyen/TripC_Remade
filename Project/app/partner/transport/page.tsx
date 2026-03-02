"use client"

import { TransportPortal } from '@/components/partner/transport/TransportPortal'
import { PartnerAuthGuard } from '@/components/partner/PartnerAuthGuard'

export default function TransportPartnerPage() {
    return (
        <PartnerAuthGuard portalName="Transport Portal">
            <TransportPortal />
        </PartnerAuthGuard>
    )
}
