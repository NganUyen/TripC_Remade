import { api } from "@/lib/api"
import type { DiningVenue, DiningReservation, DiningMenuItem } from "@/lib/dining/types"

export interface PartnerDashboardStats {
    todayRevenue: number
    todayRevenueChange: number
    pendingOrders: number
    pendingOrdersChange: number
    newCustomers: number
    newCustomersChange: number
    avgServiceTime: number
    avgServiceTimeChange: number
}

// Helper to create headers
const getHeaders = (userId: string) => ({
    headers: {
        "x-user-id": userId
    }
})

export const partnerApi = {
    // Dashboard
    getDashboardStats: async (venueId: string, userId: string): Promise<PartnerDashboardStats> => {
        const response = await api.get(`/partner/restaurant/stats?venue_id=${venueId}`, getHeaders(userId))
        return response.data
    },

    // Venues
    getMyVenues: async (userId: string): Promise<DiningVenue[]> => {
        const response = await api.get("/partner/restaurant/venues", getHeaders(userId))
        return response.data
    },

    registerVenue: async (data: Partial<DiningVenue>, userId: string): Promise<DiningVenue> => {
        const response = await api.post("/partner/restaurant/register", data, getHeaders(userId))
        return response.data
    },

    updateVenue: async (id: string, data: Partial<DiningVenue>, userId: string): Promise<DiningVenue> => {
        const response = await api.put(`/partner/restaurant/venues/${id}`, data, getHeaders(userId))
        return response.data
    },

    // Reservations
    getReservations: async (venueId: string, userId: string, status?: string): Promise<DiningReservation[]> => {
        const q = new URLSearchParams({ venue_id: venueId })
        if (status) q.append("status", status)
        const response = await api.get(`/partner/restaurant/reservations?${q.toString()}`, getHeaders(userId))
        return response.data
    },

    updateReservationStatus: async (
        id: string,
        status: 'confirmed' | 'cancelled' | 'seated' | 'completed' | 'no_show',
        userId: string,
        reason?: string
    ): Promise<DiningReservation> => {
        const response = await api.put(`/partner/restaurant/reservations/${id}`, { status, reason }, getHeaders(userId))
        return response.data
    },

    // Menu
    getMenuItems: async (venueId: string, userId: string = ""): Promise<DiningMenuItem[]> => {
        // Now using authenticated partner endpoint to ensure we see all items (including hidden/inactive)
        const response = await api.get(`/partner/restaurant/menu?venue_id=${venueId}`, getHeaders(userId))
        // The partner API returns { data: [...] } structure
        return response.data || []
    },

    updateMenuItem: async (id: string, data: Partial<DiningMenuItem>, userId: string): Promise<DiningMenuItem> => {
        const response = await api.put(`/partner/restaurant/menu/${id}`, data, getHeaders(userId))
        return response.data
    },

    createMenuItem: async (venueId: string, data: Partial<DiningMenuItem>, userId: string): Promise<DiningMenuItem> => {
        const response = await api.post(`/partner/restaurant/menu`, { ...data, venue_id: venueId }, getHeaders(userId))
        return response.data
    },

    deleteMenuItem: async (id: string, userId: string): Promise<void> => {
        await api.delete(`/partner/restaurant/menu/${id}`, getHeaders(userId))
    },

    // Tables
    getTables: async (venueId: string, userId: string): Promise<any[]> => {
        const response = await api.get(`/partner/restaurant/tables?venue_id=${venueId}`, getHeaders(userId))
        return response.data
    },

    createTable: async (data: any, userId: string): Promise<any> => {
        const response = await api.post("/partner/restaurant/tables", data, getHeaders(userId))
        return response.data
    },

    updateTable: async (id: string, data: any, userId: string): Promise<any> => {
        const response = await api.put(`/partner/restaurant/tables/${id}`, data, getHeaders(userId))
        return response.data
    },

    deleteTable: async (id: string, userId: string): Promise<void> => {
        await api.delete(`/partner/restaurant/tables/${id}`, getHeaders(userId))
    }
}
