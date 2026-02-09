"use client"

import { PartnerGuard, OrdersSkeleton } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { OrderList } from '@/components/shop/partner/orders/OrderList'

export default function ShopPartnerOrdersPage() {
    return (
        <PartnerLayout>
            <PartnerGuard loadingSkeleton={<OrdersSkeleton />}>
                <OrderList />
            </PartnerGuard>
        </PartnerLayout>
    )
}
