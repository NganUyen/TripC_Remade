/**
 * Buy Now Store
 * 
 * Manages state for "Buy Now" purchases that bypass the cart.
 * Persists to sessionStorage to survive page refreshes during checkout.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BuyNowItem {
    variantId: string;
    quantity: number;
    price: number;        // Price in cents
    title: string;
    image: string | null;
    variantName?: string;
    sku?: string;
}

interface BuyNowState {
    item: BuyNowItem | null;
    isProcessing: boolean;
    _hasHydrated: boolean;

    // Actions
    setBuyNowItem: (item: BuyNowItem) => void;
    clearBuyNowItem: () => void;
    setProcessing: (value: boolean) => void;
}

export const useBuyNowStore = create<BuyNowState>()(
    persist(
        (set) => ({
            item: null,
            isProcessing: false,
            _hasHydrated: false,

            setBuyNowItem: (item) => {
                console.log('[BuyNowStore] Setting item:', item);
                set({ item });
            },

            clearBuyNowItem: () => {
                console.log('[BuyNowStore] Clearing item');
                set({ item: null });
            },

            setProcessing: (value) => set({ isProcessing: value }),
        }),
        {
            name: 'tripc-buy-now',
            storage: createJSONStorage(() => sessionStorage),
            // Only persist the item, not processing state or hydration flag
            partialize: (state) => ({ item: state.item }),
            onRehydrateStorage: () => {
                console.log('[BuyNowStore] Hydration starting...');
                return (state, error) => {
                    if (error) {
                        console.error('[BuyNowStore] Hydration error:', error);
                    } else {
                        console.log('[BuyNowStore] Hydration complete, item:', state?.item);
                    }
                    // Use setState directly on the store to set hydration flag
                    useBuyNowStore.setState({ _hasHydrated: true });
                };
            },
        }
    )
);
