"use client"

import { PartnerGuard, SettingsSkeleton } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { SettingsView } from '@/components/shop/partner/settings/SettingsView'

export default function ShopPartnerSettingsPage() {
    return (
        <PartnerLayout>
            <PartnerGuard requiredRole="owner" loadingSkeleton={<SettingsSkeleton />}>
                <SettingsView />
            </PartnerGuard>
        </PartnerLayout>
    )
}
