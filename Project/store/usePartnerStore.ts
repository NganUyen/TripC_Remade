import { create } from 'zustand';
import { toast } from 'sonner';
import type {
    PartnerWithMembership,
    PartnerApplicationData,
    DashboardStats,
} from '@/lib/shop/types';

interface PartnerState {
    partner: PartnerWithMembership | null;
    dashboardStats: DashboardStats | null;
    isLoading: boolean;
    isApplying: boolean;
    isUpdating: boolean;
    error: string | null;

    // Init / Fetch
    fetchPartner: () => Promise<void>;
    fetchDashboardStats: (period?: string) => Promise<void>;

    // Actions
    applyAsPartner: (data: PartnerApplicationData) => Promise<boolean>;
    updateProfile: (data: Partial<Pick<PartnerWithMembership, 'display_name' | 'description' | 'logo_url' | 'cover_url' | 'phone' | 'website'>>) => Promise<boolean>;

    // Reset
    reset: () => void;
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
    partner: null,
    dashboardStats: null,
    isLoading: false,
    isApplying: false,
    isUpdating: false,
    error: null,

    fetchPartner: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/shop/partners/me');
            if (res.ok) {
                const { data } = await res.json();
                set({ partner: data });
            } else if (res.status === 401) {
                set({ partner: null });
            } else {
                const body = await res.json().catch(() => null);
                // NOT_PARTNER is expected for new users
                if (body?.error?.code !== 'NOT_PARTNER') {
                    set({ error: body?.error?.message || 'Failed to load partner info' });
                }
            }
        } catch (err) {
            console.error('Failed to fetch partner:', err);
            // Don't toast on init to avoid spam, just set error state
            set({ error: 'Connection error' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDashboardStats: async (period = '7d') => {
        const { partner } = get();
        if (!partner || partner.status !== 'approved') return;

        try {
            const res = await fetch(`/api/shop/partners/analytics/dashboard?period=${period}`);
            if (res.ok) {
                const { data } = await res.json();
                set({ dashboardStats: data });
            }
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            toast.error('Failed to load dashboard stats');
        }
    },

    applyAsPartner: async (data) => {
        set({ isApplying: true, error: null });
        try {
            const res = await fetch('/api/shop/partners/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const body = await res.json();

            if (res.ok) {
                toast.success('Application submitted successfully!');
                // Refetch partner to get full membership data
                await get().fetchPartner();
                return true;
            } else {
                const msg = body.error?.message || 'Failed to submit application';
                toast.error(msg);
                set({ error: msg });
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            set({ error: 'Connection error' });
            return false;
        } finally {
            set({ isApplying: false });
        }
    },

    updateProfile: async (data) => {
        const { partner } = get();
        if (!partner) return false;

        // Optimistic update
        const previousPartner = partner;
        set({
            isUpdating: true,
            partner: { ...partner, ...data },
        });

        try {
            const res = await fetch('/api/shop/partners/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const body = await res.json();

            if (res.ok) {
                set({ partner: { ...partner, ...body.data, role: partner.role, permissions: partner.permissions } });
                toast.success('Profile updated');
                return true;
            } else {
                // Rollback
                set({ partner: previousPartner });
                toast.error(body.error?.message || 'Failed to update profile');
                return false;
            }
        } catch (err) {
            set({ partner: previousPartner });
            toast.error('Connection error');
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },

    reset: () => {
        set({
            partner: null,
            dashboardStats: null,
            isLoading: false,
            isApplying: false,
            isUpdating: false,
            error: null,
        });
    },
}));
