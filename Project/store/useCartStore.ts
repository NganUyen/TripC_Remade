import { create } from 'zustand';
import { toast } from 'sonner';
import { Cart } from '@/lib/shop/types';


interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    pendingItemIds: string[];
    error: string | null;

    initCart: () => Promise<void>;

    addItem: (variantId: string, qty: number, itemDetails?: any) => Promise<void>;
    updateItem: (itemId: string, qty: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    applyVoucher: (code: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,
    pendingItemIds: [],
    error: null,

    initCart: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/shop/cart');

            if (res.ok) {
                const { data } = await res.json();
                set({ cart: data });
            }
        } catch (err) {
            console.error('Failed to init cart', err);
        } finally {
            set({ isLoading: false });
        }
    },

    addItem: async (variantId, qty, itemDetails) => {
        const { cart } = get();
        // Client-side validation
        if (!variantId) {
            toast.error('Please select a variant');
            return;
        }

        // Optimistic Update
        if (cart && itemDetails) {
            const existingItem = cart.items.find(i => i.variant_id === variantId);
            let optimisticItems;

            if (existingItem) {
                optimisticItems = cart.items.map(i =>
                    i.variant_id === variantId ? { ...i, qty: i.qty + qty } : i
                );
            } else {
                // Construct temporary item
                const newItem: any = {
                    id: `temp-${Date.now()}`,
                    variant_id: variantId,
                    qty,
                    unit_price: { amount: itemDetails.price, currency: itemDetails.currency || 'USD' },
                    line_total: { amount: itemDetails.price * qty, currency: itemDetails.currency || 'USD' },
                    title_snapshot: itemDetails.title,
                    variant_snapshot: itemDetails.variantName ? { Option: itemDetails.variantName } : {},
                    image: itemDetails.image
                };
                optimisticItems = [...cart.items, newItem];
            }

            // Recalc totals (approximate)
            const addedAmount = (itemDetails.price || 0) * qty;
            const newCount = optimisticItems.reduce((sum, i) => sum + i.qty, 0);

            set({
                cart: {
                    ...cart,
                    items: optimisticItems,
                    item_count: newCount,
                    subtotal: { ...cart.subtotal, amount: cart.subtotal.amount + addedAmount },
                    grand_total: { ...cart.grand_total, amount: cart.grand_total.amount + addedAmount }
                },
                pendingItemIds: [...get().pendingItemIds, variantId] // Mark as pending
            });
        } else {
            // No cart loaded yet - set loading and let the server response create it
            set({ isLoading: true, pendingItemIds: [...get().pendingItemIds, variantId] });
        }

        try {
            const res = await fetch('/api/shop/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ variant_id: variantId, qty })
            });

            const body = await res.json();

            if (res.ok) {
                set({ cart: body.data });
                toast.success('Added to cart');
            } else {
                // Revert or show error
                if (res.status === 409) {
                    toast.error(body.error?.message || 'Out of stock');
                } else {
                    toast.error(body.error?.message || 'Failed to add item');
                }
                // Trigger strict sync
                get().initCart();
            }
        } catch (err) {
            toast.error('Something went wrong');
            get().initCart();
        } finally {
            set({ isLoading: false });
            set(state => ({ pendingItemIds: state.pendingItemIds.filter(id => id !== variantId) }));
        }
    },

    updateItem: async (itemId, qty) => {
        const { cart } = get();
        if (!cart) return;

        const originalItem = cart.items.find(i => i.id === itemId);
        if (!originalItem) return;

        // Optimistic update
        const optimisticItems = cart.items.map(i =>
            i.id === itemId ? { ...i, qty } : i
        );
        // Recalc totals roughly (simple math, improved by server later)
        const subtotalDiff = (qty - originalItem.qty) * originalItem.unit_price.amount;
        // item_count is sum of all quantities
        const newItemCount = optimisticItems.reduce((sum, item) => sum + item.qty, 0);

        set({
            cart: {
                ...cart,
                items: optimisticItems,
                item_count: newItemCount,
                subtotal: { ...cart.subtotal, amount: cart.subtotal.amount + subtotalDiff },
                grand_total: { ...cart.grand_total, amount: cart.grand_total.amount + subtotalDiff }
            },
            pendingItemIds: [...get().pendingItemIds, itemId]
        });

        try {
            const res = await fetch(`/api/shop/cart/items/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ qty })
            });

            const body = await res.json();

            if (res.ok) {
                set({ cart: body.data }); // Replace with authoritative
                // No toast for qty update usually, maybe for errors
            } else {
                // Rollback
                set({ cart });
                if (res.status === 409) {
                    toast.error(body.error?.message || 'Insufficient stock');
                } else {
                    toast.error(body.error?.message || 'Failed to update quantity');
                }
            }
        } catch (err) {
            set({ cart }); // Rollback
            toast.error('Connection error');
        } finally {
            set(state => ({ pendingItemIds: state.pendingItemIds.filter(id => id !== itemId) }));
        }
    },

    removeItem: async (itemId) => {
        const { cart } = get();
        if (!cart) return;

        const removedItem = cart.items.find(i => i.id === itemId);
        // Optimistic: remove item and update item_count
        const optimisticItems = cart.items.filter(i => i.id !== itemId);
        const newItemCount = optimisticItems.reduce((sum, item) => sum + item.qty, 0);
        const subtotalDiff = removedItem ? removedItem.line_total.amount : 0;

        set({
            cart: {
                ...cart,
                items: optimisticItems,
                item_count: newItemCount,
                subtotal: { ...cart.subtotal, amount: cart.subtotal.amount - subtotalDiff },
                grand_total: { ...cart.grand_total, amount: cart.grand_total.amount - subtotalDiff }
            },
            pendingItemIds: [...get().pendingItemIds, itemId]
        });

        try {
            const res = await fetch(`/api/shop/cart/items/${itemId}`, {
                method: 'DELETE',

            });

            if (res.ok) {
                const body = await res.json();
                set({ cart: body.data });
                toast.success('Item removed');
            } else {
                set({ cart }); // Rollback
                toast.error('Failed to remove item');
            }
        } catch (err) {
            set({ cart });
        } finally {
            set(state => ({ pendingItemIds: state.pendingItemIds.filter(id => id !== itemId) }));
        }
    },

    applyVoucher: async (code: string) => {
        const { cart } = get();
        if (!cart) return;
        set({ isLoading: true });

        try {
            const res = await fetch('/api/v1/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    cartTotal: cart.subtotal.amount
                })
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                const discountAmount = data.discountAmount;
                const newGrandTotal = Math.max(0, cart.subtotal.amount - discountAmount);
                set({
                    cart: {
                        ...cart,
                        coupon_code: code,
                        discount_total: { ...cart.discount_total, amount: discountAmount },
                        grand_total: { ...cart.grand_total, amount: newGrandTotal }
                    }
                });
                toast.success(data.message);
            } else {
                toast.error(data.error || 'Failed to apply voucher');
                set({ error: data.error });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to apply voucher');
        } finally {
            set({ isLoading: false });
        }
    }
}));
