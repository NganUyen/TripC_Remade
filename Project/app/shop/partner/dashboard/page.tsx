"use client"

import { PartnerGuard, DashboardSkeleton } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { DashboardView } from '@/components/shop/partner/dashboard/DashboardView'

export default function ShopPartnerDashboardPage() {
    return (
        <PartnerLayout>
            <PartnerGuard loadingSkeleton={<DashboardSkeleton />}>
                <DashboardView />
            </PartnerGuard>
        </PartnerLayout>
    )
}
