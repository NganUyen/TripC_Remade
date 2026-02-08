"use client"

import { PartnerGuard, ProductsSkeleton } from '@/components/shop/partner/shared/PartnerGuard'
import { PartnerLayout } from '@/components/shop/partner/layout/PartnerLayout'
import { ProductList } from '@/components/shop/partner/products/ProductList'

export default function ShopPartnerProductsPage() {
    return (
        <PartnerLayout>
            <PartnerGuard loadingSkeleton={<ProductsSkeleton />}>
                <ProductList />
            </PartnerGuard>
        </PartnerLayout>
    )
}
