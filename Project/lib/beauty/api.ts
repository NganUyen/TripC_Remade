// Client-side API utilities for Beauty module

import { api } from "@/lib/api";
import type {
  BeautyVenue,
  BeautyService,
  BeautyAppointment,
  CreateVenueRequest,
  CreateServiceRequest,
  CreateAppointmentRequest,
  VenueSearchParams,
  VenueListResponse,
} from "./types";

export const beautyApi = {
  getVenues: async (params?: VenueSearchParams): Promise<VenueListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    const response = await api.get(`/beauty/venues?${queryParams.toString()}`);
    return response.data;
  },

  getVenueById: async (id: string): Promise<BeautyVenue> => {
    const response = await api.get(`/beauty/venues/${id}`);
    return response.data;
  },

  getVenueBySlug: async (slug: string): Promise<BeautyVenue> => {
    const response = await api.get(`/beauty/venues/slug/${slug}`);
    return response.data;
  },

  getFeaturedVenues: async (limit: number = 10): Promise<BeautyVenue[]> => {
    const response = await api.get(`/beauty/venues/featured?limit=${limit}`);
    return response.data;
  },

  /** Distinct categories from DB (venues + services). */
  getCategories: async (): Promise<{ id: string; label: string }[]> => {
    const response = await api.get("/beauty/categories");
    return Array.isArray(response?.data) ? response.data : [];
  },

  createVenue: async (venueData: CreateVenueRequest): Promise<BeautyVenue> => {
    const response = await api.post("/beauty/venues", venueData);
    return response.data;
  },

  updateVenue: async (id: string, updates: Partial<CreateVenueRequest>): Promise<BeautyVenue> => {
    const response = await api.put(`/beauty/venues/${id}`, updates);
    return response.data;
  },

  deleteVenue: async (id: string): Promise<void> => {
    await api.delete(`/beauty/venues/${id}`);
  },

  getVenueServices: async (venueId: string): Promise<BeautyService[]> => {
    const response = await api.get(`/beauty/services?venue_id=${venueId}`);
    return response.data;
  },

  /** Get available time slots for a venue on a date (optionally for a service → uses service duration). */
  getAvailableSlots: async (
    venueId: string,
    date: string,
    serviceId?: string,
  ): Promise<string[]> => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append("service_id", serviceId);
    const response = await api.get(
      `/beauty/venues/${venueId}/availability?${params.toString()}`,
    );
    const body = response?.data;
    return Array.isArray(body?.data?.available_slots)
      ? body.data.available_slots
      : [];
  },

  getServiceById: async (id: string): Promise<BeautyService> => {
    const response = await api.get(`/beauty/services/${id}`);
    return response.data;
  },

  getFeaturedServices: async (venueId?: string, limit?: number): Promise<BeautyService[]> => {
    const q = new URLSearchParams();
    if (venueId) q.append("venue_id", venueId);
    if (limit) q.append("limit", String(limit));
    const response = await api.get(`/beauty/services/featured?${q.toString()}`);
    return response.data;
  },

  getTopRatedServices: async (limit: number = 10): Promise<BeautyService[]> => {
    const response = await api.get(`/beauty/services/top-rated?limit=${limit}`);
    return response.data;
  },

  getServicesListing: async (
    limit: number = 20,
  ): Promise<
    (BeautyService & {
      beauty_venues: {
        id: string;
        name: string;
        average_rating: number;
        review_count: number;
      } | null;
    })[]
  > => {
    const response = await api.get(`/beauty/services/listing?limit=${limit}`);
    return response.data;
  },

  createAppointment: async (
    appointmentData: CreateAppointmentRequest,
    options?: { headers?: Record<string, string> },
  ): Promise<BeautyAppointment> => {
    const response = await api.post(
      "/beauty/appointments",
      appointmentData,
      options?.headers ? { headers: options.headers } : undefined,
    );
    return response.data;
  },

  getAppointment: async (id: string): Promise<BeautyAppointment> => {
    const response = await api.get(`/beauty/appointments/${id}`);
    return response.data;
  },

  getUserAppointments: async (userId: string): Promise<BeautyAppointment[]> => {
    const response = await api.get(`/beauty/appointments?user_id=${userId}`);
    return response.data;
  },

  cancelAppointment: async (id: string, reason?: string): Promise<void> => {
    const url = reason
      ? `/beauty/appointments/${id}?reason=${encodeURIComponent(reason)}`
      : `/beauty/appointments/${id}`;
    await api.delete(url);
  },
};
