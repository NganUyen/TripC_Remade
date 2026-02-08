"use client"

import { PartnerGuard, SettingsSkeleton } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { TeamManagement } from '@/components/shop/partner/settings/TeamManagement'

export default function ShopPartnerTeamPage() {
    return (
        <PartnerLayout>
            <PartnerGuard requiredRole="owner" loadingSkeleton={<SettingsSkeleton />}>
                <TeamManagement />
            </PartnerGuard>
        </PartnerLayout>
    )
}
