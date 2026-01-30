// Client-side API utilities for Dining module
// Use these functions in React components to interact with the backend

import { api } from '@/lib/api'
import type {
  DiningVenue,
  DiningMenu,
  DiningMenuItem,
  DiningReservation,
  DiningAppointment,
  CreateVenueRequest,
  CreateReservationRequest,
  CreateDiningAppointmentRequest,
  VenueSearchParams,
  VenueListResponse,
} from './types'

// Venue API functions
export const diningApi = {
  // Venues
  getVenues: async (params?: VenueSearchParams): Promise<VenueListResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })
    }
    const response = await api.get(`/dining/venues?${queryParams.toString()}`)
    return response.data
  },

  getVenueById: async (id: string): Promise<DiningVenue> => {
    const response = await api.get(`/dining/venues/${id}`)
    return response.data
  },

  getVenueBySlug: async (slug: string): Promise<DiningVenue> => {
    const response = await api.get(`/dining/venues/slug/${slug}`)
    return response.data
  },

  getFeaturedVenues: async (limit: number = 10): Promise<DiningVenue[]> => {
    const response = await api.get(`/dining/venues/featured?limit=${limit}`)
    return response.data
  },

  createVenue: async (venueData: CreateVenueRequest): Promise<DiningVenue> => {
    const response = await api.post('/dining/venues', venueData)
    return response.data
  },

  updateVenue: async (id: string, updates: Partial<CreateVenueRequest>): Promise<DiningVenue> => {
    const response = await api.put(`/dining/venues/${id}`, updates)
    return response.data
  },

  deleteVenue: async (id: string): Promise<void> => {
    await api.delete(`/dining/venues/${id}`)
  },

  // Menus
  getVenueMenus: async (venueId: string): Promise<DiningMenu[]> => {
    const response = await api.get(`/dining/menus?venue_id=${venueId}`)
    return response.data
  },

  getMenuItems: async (options: {
    venueId?: string
    menuId?: string
    featured?: boolean
  }): Promise<DiningMenuItem[]> => {
    const queryParams = new URLSearchParams()
    if (options.venueId) queryParams.append('venue_id', options.venueId)
    if (options.menuId) queryParams.append('menu_id', options.menuId)
    if (options.featured) queryParams.append('featured', 'true')

    const response = await api.get(`/dining/menus/items?${queryParams.toString()}`)
    return response.data
  },

  // Reservations
  createReservation: async (reservationData: CreateReservationRequest): Promise<DiningReservation> => {
    const response = await api.post('/dining/reservations', reservationData)
    return response.data
  },

  getReservation: async (id: string): Promise<DiningReservation> => {
    const response = await api.get(`/dining/reservations/${id}`)
    return response.data
  },

  getUserReservations: async (userId: string): Promise<DiningReservation[]> => {
    const response = await api.get(`/dining/reservations?user_id=${userId}`)
    return response.data
  },

  getVenueReservations: async (venueId: string, date: string, status?: string): Promise<DiningReservation[]> => {
    const queryParams = new URLSearchParams({ venue_id: venueId, date })
    if (status) queryParams.append('status', status)
    const response = await api.get(`/dining/reservations?${queryParams.toString()}`)
    return response.data
  },

  updateReservation: async (id: string, status: string, metadata?: any): Promise<DiningReservation> => {
    const response = await api.put(`/dining/reservations/${id}`, { status, ...metadata })
    return response.data
  },

  cancelReservation: async (id: string, reason?: string): Promise<void> => {
    const url = reason ? `/dining/reservations/${id}?reason=${encodeURIComponent(reason)}` : `/dining/reservations/${id}`
    await api.delete(url)
  },

  checkAvailability: async (
    venueId: string,
    date: string,
    time: string,
    guestCount: number
  ): Promise<{ available: boolean; reason?: string }> => {
    const queryParams = new URLSearchParams({
      venue_id: venueId,
      date,
      time,
      guest_count: String(guestCount),
    })
    const response = await api.get(`/dining/reservations/check?${queryParams.toString()}`)
    return response.data
  },

  // Appointments (new booking flow)
  createAppointment: async (data: CreateDiningAppointmentRequest): Promise<DiningAppointment> => {
    const response = await api.post('/dining/appointments', data)
    return response.data
  },

  getAppointment: async (id: string): Promise<DiningAppointment> => {
    const response = await api.get(`/dining/appointments/${id}`)
    return response.data
  },

  getUserAppointments: async (userId: string): Promise<DiningAppointment[]> => {
    const response = await api.get(`/dining/appointments?user_id=${userId}`)
    return response.data
  },

  cancelAppointment: async (id: string, reason?: string): Promise<void> => {
    const url = reason ? `/dining/appointments/${id}?reason=${encodeURIComponent(reason)}` : `/dining/appointments/${id}`
    await api.delete(url)
  },

  getAvailableTimes: async (
    venueId: string,
    date: string,
    guestCount: number
  ): Promise<{ times: string[]; reason?: string }> => {
    const queryParams = new URLSearchParams({
      date,
      guest_count: String(guestCount),
    })
    const response = await api.get(`/dining/venues/${venueId}/available-times?${queryParams.toString()}`)
    return response.data
  },
}
