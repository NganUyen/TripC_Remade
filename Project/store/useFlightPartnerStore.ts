/**
 * Zustand store for Flight Partner Portal
 * Mirrors the shop partner store pattern for auth, status gating, and onboarding.
 */

import { create } from "zustand";
import { toast } from "sonner";

export type FlightPartnerStatus =
  | "pending"
  | "approved"
  | "suspended"
  | "banned";
export type FlightPartnerRole = "owner" | "admin" | "manager" | "staff";

export interface FlightPartner {
  id: string;
  airline_code: string;
  name: string;
  is_active: boolean;
  status: FlightPartnerStatus;
  rejection_reason?: string | null;
  role: FlightPartnerRole;
}

export interface FlightPartnerApplicationData {
  airline_name: string;
  airline_code: string; // IATA code (2-letter or 3-letter)
  email: string;
  phone?: string;
  website?: string;
  headquarters_country?: string;
  headquarters_city?: string;
  fleet_size?: number;
  description?: string;
  iata_membership_number?: string;
  certificate_urls?: string[];
}

interface FlightPartnerState {
  partner: FlightPartner | null;
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;

  fetchPartner: () => Promise<void>;
  applyAsPartner: (data: FlightPartnerApplicationData) => Promise<boolean>;
  reset: () => void;
}

export const useFlightPartnerStore = create<FlightPartnerState>((set, get) => ({
  partner: null,
  isLoading: false,
  isApplying: false,
  error: null,

  fetchPartner: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/partner/flight/me");
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
      console.error("Failed to fetch flight partner:", err);
      set({ error: "Connection error", partner: null });
    } finally {
      set({ isLoading: false });
    }
  },

  applyAsPartner: async (data) => {
    set({ isApplying: true, error: null });
    try {
      const res = await fetch("/api/partner/flight/apply", {
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
