import { create } from 'zustand';
import { toast } from 'sonner';
import type { PartnerOrder } from '@/lib/shop/types';

interface OrderFilters {
    status: string;
    from: string;
    to: string;
}

interface PartnerOrderState {
    orders: PartnerOrder[];
    total: number;
    currentOrder: PartnerOrder | null;
    filters: OrderFilters;
    page: number;
    limit: number;
    isLoading: boolean;
    isLoadingOrder: boolean;
    isUpdating: boolean;
    error: string | null;

    // List
    fetchOrders: (params?: Partial<OrderFilters & { page?: number }>) => Promise<void>;
    setFilters: (filters: Partial<OrderFilters>) => void;
    setPage: (page: number) => void;

    // Single
    fetchOrder: (id: string) => Promise<void>;
    clearCurrentOrder: () => void;

    // Actions
    updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
}

export const usePartnerOrderStore = create<PartnerOrderState>((set, get) => ({
    orders: [],
    total: 0,
    currentOrder: null,
    filters: { status: '', from: '', to: '' },
    page: 1,
    limit: 20,
    isLoading: false,
    isLoadingOrder: false,
    isUpdating: false,
    error: null,

    fetchOrders: async (params) => {
        const { filters, page, limit } = get();
        const merged = {
            status: params?.status ?? filters.status,
            from: params?.from ?? filters.from,
            to: params?.to ?? filters.to,
        };
        const currentPage = params?.page ?? page;
        const offset = (currentPage - 1) * limit;

        set({ filters: merged, page: currentPage, isLoading: true, error: null });

        try {
            const searchParams = new URLSearchParams();
            if (merged.status) searchParams.set('status', merged.status);
            if (merged.from) searchParams.set('from', merged.from);
            if (merged.to) searchParams.set('to', merged.to);
            searchParams.set('limit', limit.toString());
            searchParams.set('offset', offset.toString());

            const res = await fetch(`/api/shop/partners/orders?${searchParams}`);
            if (res.ok) {
                const body = await res.json();
                set({ orders: body.data, total: body.meta?.total || 0 });
            } else {
                const body = await res.json().catch(() => null);
                set({ error: body?.error?.message || 'Failed to load orders' });
            }
        } catch (err) {
            console.error('Failed to fetch partner orders:', err);
            toast.error('Failed to load orders');
        } finally {
            set({ isLoading: false });
        }
    },

    setFilters: (newFilters) => {
        const { filters } = get();
        const merged = { ...filters, ...newFilters };
        get().fetchOrders({ ...merged, page: 1 });
    },

    setPage: (page) => {
        get().fetchOrders({ page });
    },

    fetchOrder: async (id) => {
        set({ isLoadingOrder: true, error: null });
        try {
            const res = await fetch(`/api/shop/partners/orders/${id}`);
            if (res.ok) {
                const { data } = await res.json();
                set({ currentOrder: data });
            } else {
                const body = await res.json().catch(() => null);
                set({ error: body?.error?.message || 'Order not found' });
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
            toast.error('Failed to load order details');
        } finally {
            set({ isLoadingOrder: false });
        }
    },

    clearCurrentOrder: () => set({ currentOrder: null }),

    updateOrderStatus: async (orderId, status) => {
        set({ isUpdating: true });
        try {
            const res = await fetch(`/api/shop/partners/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                // Update local state
                const { orders, currentOrder } = get();
                set({
                    orders: orders.map(o =>
                        o.id === orderId ? { ...o, status } : o
                    ),
                    currentOrder: currentOrder?.id === orderId
                        ? { ...currentOrder, status }
                        : currentOrder,
                });
                toast.success(`Order status updated to ${status}`);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to update order status');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },
}));
