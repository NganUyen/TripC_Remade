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
    return response as VenueListResponse;
  },

  getVenueById: async (id: string): Promise<BeautyVenue> => {
    const response = await api.get(`/beauty/venues/${id}`);
    return response as BeautyVenue;
  },

  getVenueBySlug: async (slug: string): Promise<BeautyVenue> => {
    const response = await api.get(`/beauty/venues/slug/${slug}`);
    return response as BeautyVenue;
  },

  getFeaturedVenues: async (limit: number = 10): Promise<BeautyVenue[]> => {
    const response = await api.get(`/beauty/venues/featured?limit=${limit}`);
    return response as BeautyVenue[];
  },

  /** Distinct categories from DB (venues + services). */
  getCategories: async (): Promise<{ id: string; label: string }[]> => {
    const response = await api.get("/beauty/categories");
    return Array.isArray(response) ? response : [];
  },

  createVenue: async (venueData: CreateVenueRequest): Promise<BeautyVenue> => {
    const response = await api.post("/beauty/venues", venueData);
    return response as BeautyVenue;
  },

  updateVenue: async (id: string, updates: Partial<CreateVenueRequest>): Promise<BeautyVenue> => {
    const response = await api.put(`/beauty/venues/${id}`, updates);
    return response as BeautyVenue;
  },

  deleteVenue: async (id: string): Promise<void> => {
    await api.delete(`/beauty/venues/${id}`);
  },

  getVenueServices: async (venueId: string): Promise<BeautyService[]> => {
    const response = await api.get(`/beauty/services?venue_id=${venueId}`);
    return response as BeautyService[];
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
    // Handle special case where response might be nested
    return Array.isArray(response?.available_slots)
      ? response.available_slots
      : [];
  },

  getServiceById: async (id: string): Promise<BeautyService> => {
    const response = await api.get(`/beauty/services/${id}`);
    return response as BeautyService;
  },

  getFeaturedServices: async (venueId?: string, limit?: number): Promise<BeautyService[]> => {
    const q = new URLSearchParams();
    if (venueId) q.append("venue_id", venueId);
    if (limit) q.append("limit", String(limit));
    const response = await api.get(`/beauty/services/featured?${q.toString()}`);
    return response as BeautyService[];
  },

  getTopRatedServices: async (limit: number = 10): Promise<BeautyService[]> => {
    const response = await api.get(`/beauty/services/top-rated?limit=${limit}`);
    return response as BeautyService[];
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
    return response as any;
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
    return response as BeautyAppointment;
  },

  getAppointment: async (id: string): Promise<BeautyAppointment> => {
    const response = await api.get(`/beauty/appointments/${id}`);
    return response as BeautyAppointment;
  },

  getUserAppointments: async (userId: string): Promise<BeautyAppointment[]> => {
    const response = await api.get(`/beauty/appointments?user_id=${userId}`);
    return response as BeautyAppointment[];
  },

  cancelAppointment: async (id: string, reason?: string): Promise<void> => {
    const url = reason
      ? `/beauty/appointments/${id}?reason=${encodeURIComponent(reason)}`
      : `/beauty/appointments/${id}`;
    await api.delete(url);
  },

  // ============================================================
  // Review functions
  // ============================================================

  getVenueReviews: async (
    venueId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ reviews: any[]; stats: any }> => {
    const response = await api.get(
      `/beauty/venues/${venueId}/reviews?limit=${limit}&offset=${offset}`,
    );
    return response as { reviews: any[]; stats: any };
  },

  createReview: async (
    data: {
      venue_id: string;
      service_id?: string;
      rating: number;
      title?: string;
      comment?: string;
    },
    options?: { headers?: Record<string, string> },
  ): Promise<any> => {
    const response = await api.post(
      `/beauty/venues/${data.venue_id}/reviews`,
      data,
      options?.headers ? { headers: options.headers } : undefined,
    );
    return response;
  },
};
