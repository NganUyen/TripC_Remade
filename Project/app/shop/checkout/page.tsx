'use client';

import { UnifiedCheckoutContainer } from '@/components/checkout/unified-checkout-container';
import { useCartStore } from '@/store/useCartStore';
import { useBuyNowStore } from '@/store/useBuyNowStore';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopCheckoutPage() {
    const { cart, isLoading: isCartLoading } = useCartStore();
    const { item: buyNowItem, clearBuyNowItem, setProcessing, _hasHydrated } = useBuyNowStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const hasRedirected = useRef(false);

    // Detect buy-now mode from URL
    const isBuyNowMode = searchParams.get('mode') === 'buy-now';

    // For buy-now mode: we're ready if item exists in memory OR hydration is complete
    // (Item in memory = came from product page, Hydration = page refresh)
    const isBuyNowReady = buyNowItem !== null || _hasHydrated;

    console.log('[Checkout] Render state:', { 
        mounted, 
        _hasHydrated, 
        isBuyNowMode, 
        isBuyNowReady,
        buyNowItem: buyNowItem ? 'exists' : 'null' 
    });

    useEffect(() => {
        setMounted(true);
        // Reset processing state when page mounts
        setProcessing(false);
    }, [setProcessing]);

    useEffect(() => {
        // Handle empty state redirects
        // Wait for mount AND either item exists or hydration complete
        if (!mounted || hasRedirected.current) return;

        if (isBuyNowMode) {
            // Only redirect if we're sure there's no item (hydration complete + no item)
            if (_hasHydrated && !buyNowItem) {
                console.log('[Checkout] No buy-now item found after hydration, redirecting...');
                hasRedirected.current = true;
                router.push('/shop');
            }
        } else {
            // In cart mode, redirect if cart is empty
            if (!isCartLoading && (!cart || cart.items.length === 0)) {
                // Optional: Redirect if empty, or let container handle it
                // router.push('/shop/cart');
            }
        }
    }, [mounted, _hasHydrated, isBuyNowMode, buyNowItem, cart, isCartLoading, router]);

    // Loading state
    // For buy-now: wait for mount AND (item exists OR hydration complete)
    // For cart: wait for mount AND cart loading complete
    const isLoading = !mounted || (isBuyNowMode ? !isBuyNowReady : isCartLoading);
    
    if (isLoading) {
        return <div className="p-10 text-center">Loading checkout...</div>;
    }

    // After we're ready, check if we have valid data for buy-now mode
    if (isBuyNowMode && !buyNowItem) {
        // Will redirect in useEffect, show loading in meantime
        return <div className="p-10 text-center">Loading checkout...</div>;
    }

    // Build initial data based on mode
    let initialData;

    if (isBuyNowMode && buyNowItem) {
        // Buy Now mode: Single item from buyNowStore
        console.log('[Checkout] Building buy-now initialData with item:', buyNowItem);
        initialData = {
            items: [{
                variantId: buyNowItem.variantId,
                name: buyNowItem.title,
                quantity: buyNowItem.quantity,
                price: buyNowItem.price, // Already in cents
                image: buyNowItem.image,
            }],
            isBuyNow: true,
            // No cartId, couponCode, or discount for buy-now
        };
    } else {
        // Cart mode: Items from cart store
        // ShopCheckoutDetails expects: items: { variantId, quantity, price }[]
        initialData = {
            items: cart?.items.map(item => ({
                variantId: item.variant_id,
                name: item.title_snapshot,
                quantity: item.qty,
                price: item.unit_price.amount, // Pass the numeric amount (cents)
                image: (item as any).image // Pass image if available
            })) || [],
            cartId: cart?.id,
            couponCode: cart?.coupon_code,
            discountAmount: cart?.discount_total?.amount || 0
        };
    }

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] py-12">
            <UnifiedCheckoutContainer
                serviceType="shop"
                initialData={initialData}
            />
        </div>
    );
}
