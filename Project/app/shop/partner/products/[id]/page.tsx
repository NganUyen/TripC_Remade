"use client"

import { useParams } from 'next/navigation'
import { PartnerGuard } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { ProductForm } from '@/components/shop/partner/products/ProductForm'

export default function ShopPartnerEditProductPage() {
    const params = useParams<{ id: string }>()

    return (
        <PartnerGuard>
            <PartnerLayout>
                <ProductForm productId={params.id} />
            </PartnerLayout>
        </PartnerGuard>
    )
}
