/**
 * Zustand store for Hotel Partner Portal
 * Mirrors the shop partner store pattern for auth, status gating, and onboarding.
 */

import { create } from "zustand";
import { toast } from "sonner";

export type HotelPartnerStatus =
  | "pending"
  | "approved"
  | "suspended"
  | "banned";
export type HotelPartnerRole = "owner" | "admin" | "manager" | "staff";

export interface HotelPartner {
  id: string;
  name: string;
  code?: string;
  is_active: boolean;
  status: HotelPartnerStatus;
  rejection_reason?: string | null;
  role: HotelPartnerRole;
  /** clerk_user_id of the signed-in user (from partner_users join) */
  clerk_user_id?: string;
}

export interface HotelPartnerApplicationData {
  hotel_name: string;
  display_name?: string;
  email: string;
  phone?: string;
  website?: string;
  star_rating?: number;
  property_type?: string;
  room_count?: number;
  address_line1?: string;
  city?: string;
  country_code?: string;
  description?: string;
  business_registration_number?: string;
  tax_id?: string;
  certificate_urls?: string[];
}

interface HotelPartnerState {
  partner: HotelPartner | null;
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;

  fetchPartner: () => Promise<void>;
  applyAsPartner: (data: HotelPartnerApplicationData) => Promise<boolean>;
  reset: () => void;
}

export const useHotelPartnerStore = create<HotelPartnerState>((set, get) => ({
  partner: null,
  isLoading: false,
  isApplying: false,
  error: null,

  fetchPartner: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/partner/hotel/me");
      if (res.ok) {
        const { data } = await res.json();
        set({ partner: data });
      } else if (res.status === 401) {
        set({ partner: null });
      } else {
        const body = await res.json().catch(() => null);
        if (body?.error?.code !== "NOT_PARTNER") {
          set({ error: body?.error?.message || "Failed to load partner info" });
        }
        set({ partner: null });
      }
    } catch (err) {
      console.error("Failed to fetch hotel partner:", err);
      set({ error: "Connection error", partner: null });
    } finally {
      set({ isLoading: false });
    }
  },

  applyAsPartner: async (data) => {
    set({ isApplying: true, error: null });
    try {
      const res = await fetch("/api/partner/hotel/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (res.ok) {
        toast.success("Application submitted! We'll review it shortly.");
        await get().fetchPartner();
        return true;
      } else {
        const msg = body.error?.message || "Failed to submit application";
        toast.error(msg);
        set({ error: msg });
        return false;
      }
    } catch (err) {
      toast.error("Connection error");
      set({ error: "Connection error" });
      return false;
    } finally {
      set({ isApplying: false });
    }
  },

  reset: () =>
    set({ partner: null, isLoading: false, isApplying: false, error: null }),
}));
