"use client"

import { PartnerGuard } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { ProductForm } from '@/components/shop/partner/products/ProductForm'

export default function ShopPartnerNewProductPage() {
    return (
        <PartnerGuard>
            <PartnerLayout>
                <ProductForm />
            </PartnerLayout>
        </PartnerGuard>
    )
}
