"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCartAnimation } from "@/store/useCartAnimation";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export const CartIcon = () => {
    const pathname = usePathname();
    const { userId, isLoaded } = useAuth();
    
    // Subscribe to the whole cart to ensure re-renders when cart changes
    const cart = useCartStore((state) => state.cart);
    const itemCount = cart?.item_count ?? 0;
    const initCart = useCartStore((state) => state.initCart);
    const { setTargetRef } = useCartAnimation();
    const iconRef = useRef<HTMLAnchorElement>(null);

    // Auto-init cart when user is authenticated
    useEffect(() => {
        if (isLoaded && userId) {
            initCart();
        }
    }, [isLoaded, userId, initCart]);

    // Set target ref for fly animation
    useEffect(() => {
        if (iconRef.current) {
            setTargetRef(iconRef as any);
        }
    }, [setTargetRef]);

    // Only visible on /shop routes
    if (!pathname?.startsWith("/shop")) return null;

    return (
        <Link
            href="/shop/cart"
            ref={iconRef}
            className="relative hover:bg-transparent p-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            id="cart-icon-target"
        >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount}
                </span>
            )}
        </Link>
    );
};
