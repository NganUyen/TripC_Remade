'use client';

import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';
import { useCartStore } from '@/store/useCartStore'; // Verify import path from cart page
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopCheckoutPage() {
    const { cart, isLoading } = useCartStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isLoading && (!cart || cart.items.length === 0)) {
            // Optional: Redirect if empty, or let container handle it
            // router.push('/shop/cart');
        }
    }, [cart, isLoading, router]);


    if (!mounted || isLoading) {
        return <div className="p-10 text-center">Loading checkout...</div>;
    }

    // Transform cart items to expected format if needed
    // ShopCheckoutDetails expects: items: { variantId, quantity, price }[]
    const initialData = {
        items: cart?.items.map(item => ({
            variantId: item.id, // or variant_id if different
            name: item.title_snapshot, // Helpful for display in summary
            quantity: item.qty,
            price: item.unit_price.amount, // Pass the numeric amount (cents)
            image: item.image // Pass image if available
        })) || [],
        cartId: cart?.id
    };

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] py-12">
            <UnifiedCheckoutContainer
                serviceType="shop"
                initialData={initialData}
            />
        </div>
    );
}
