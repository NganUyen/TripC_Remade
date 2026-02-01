// Client-side API utilities for Events module
// Use these functions in React components to interact with the backend

import { api } from '@/lib/api';
import type {
  EventWithSessions,
  EventSearchParams,
  EventListResponse,
  EventDetailResponse,
  TicketAvailabilityResponse,
  EventTicketTypeWithAvailability,
  EventBookingWithDetails,
  CreateEventBookingRequest,
} from './types';

export const eventsApi = {
  // ==========================================================================
  // Events
  // ==========================================================================

  /**
   * Get paginated list of events with filters
   */
  getEvents: async (params?: EventSearchParams): Promise<EventListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/events?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  getEventById: async (id: string): Promise<EventWithSessions> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Get a single event by slug
   */
  getEventBySlug: async (slug: string): Promise<EventWithSessions> => {
    const response = await api.get(`/events/slug/${slug}`);
    return response.data;
  },

  /**
   * Get featured events
   */
  getFeaturedEvents: async (limit: number = 6): Promise<EventWithSessions[]> => {
    const response = await api.get(`/events?is_featured=true&limit=${limit}`);
    return response.data.events;
  },

  // ==========================================================================
  // Availability
  // ==========================================================================

  /**
   * Get ticket availability for a session
   */
  getTicketAvailability: async (sessionId: string): Promise<EventTicketTypeWithAvailability[]> => {
    const response = await api.get(`/events/sessions/${sessionId}/availability`);
    return response.data.ticket_types;
  },

  /**
   * Check if specific quantity is available
   */
  checkAvailability: async (
    ticketTypeId: string,
    quantity: number
  ): Promise<{ available: boolean; remaining: number; price: number }> => {
    const response = await api.get(
      `/events/tickets/${ticketTypeId}/check?quantity=${quantity}`
    );
    return response.data;
  },

  // ==========================================================================
  // Bookings
  // ==========================================================================

  /**
   * Get user's event bookings
   */
  getUserBookings: async (): Promise<EventBookingWithDetails[]> => {
    const response = await api.get('/events/bookings');
    return response.data.bookings;
  },

  /**
   * Get a single booking by ID
   */
  getBooking: async (id: string): Promise<EventBookingWithDetails> => {
    const response = await api.get(`/events/bookings/${id}`);
    return response.data;
  },

  /**
   * Get booking by confirmation code
   */
  getBookingByCode: async (code: string): Promise<EventBookingWithDetails> => {
    const response = await api.get(`/events/bookings/code/${code}`);
    return response.data;
  },

  // ==========================================================================
  // Price Calculation (client-side helper)
  // ==========================================================================

  /**
   * Calculate price breakdown for display
   */
  calculatePrice: (
    ticketPrice: number,
    adultCount: number,
    childCount: number,
    childDiscount: number = 0.5, // 50% discount for children
    serviceFeeRate: number = 0 // No service fee by default
  ) => {
    const adultTotal = ticketPrice * adultCount;
    const childTotal = ticketPrice * childCount * (1 - childDiscount);
    const subtotal = adultTotal + childTotal;
    const serviceFee = Math.round(subtotal * serviceFeeRate);
    const total = subtotal + serviceFee;

    return {
      adultTotal,
      childTotal,
      subtotal,
      serviceFee,
      total,
      quantity: adultCount + childCount,
    };
  },
};

export default eventsApi;
