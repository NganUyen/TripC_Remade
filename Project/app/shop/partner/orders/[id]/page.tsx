"use client"

import { useParams } from 'next/navigation'
import { PartnerGuard } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { OrderDetail } from '@/components/shop/partner/orders/OrderDetail'

export default function ShopPartnerOrderDetailPage() {
    const params = useParams<{ id: string }>()

    return (
        <PartnerGuard>
            <PartnerLayout>
                <OrderDetail orderId={params.id} />
            </PartnerLayout>
        </PartnerGuard>
    )
}
