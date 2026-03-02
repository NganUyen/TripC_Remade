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
// Note: api.ts fetchAPI already spreads init, so pass { headers: {...} } directly
const getHeaders = (userId: string): RequestInit => ({
    headers: {
        "x-user-id": userId
    }
})

export const partnerApi = {
    // Dashboard
    getDashboardStats: async (venueId: string, userId: string): Promise<PartnerDashboardStats> => {
        // fetchAPI already unwraps { success, data } → returns data directly
        const result = await api.get(`/partner/restaurant/stats?venue_id=${venueId}`, getHeaders(userId))
        return result
    },

    // Venues
    getMyVenues: async (userId: string): Promise<DiningVenue[]> => {
        // fetchAPI unwraps { success: true, data: [...] } → returns array directly
        const result = await api.get("/partner/restaurant/venues", getHeaders(userId))
        // Handle both wrapped and raw array responses defensively
        if (Array.isArray(result)) return result
        if (result && Array.isArray(result.data)) return result.data
        return []
    },

    registerVenue: async (data: Partial<DiningVenue>, userId: string): Promise<DiningVenue> => {
        const result = await api.post("/partner/restaurant/register", data, getHeaders(userId))
        // fetchAPI already unwraps → result is the venue object
        if (result && result.id) return result
        if (result && result.data) return result.data
        return result
    },

    updateVenue: async (id: string, data: Partial<DiningVenue>, userId: string): Promise<DiningVenue> => {
        const result = await api.put(`/partner/restaurant/venues/${id}`, data, getHeaders(userId))
        return result
    },

    // Reservations
    getReservations: async (venueId: string, userId: string, status?: string): Promise<DiningReservation[]> => {
        const q = new URLSearchParams({ venue_id: venueId })
        if (status) q.append("status", status)
        const result = await api.get(`/partner/restaurant/reservations?${q.toString()}`, getHeaders(userId))
        if (Array.isArray(result)) return result
        if (result && Array.isArray(result.data)) return result.data
        return []
    },

    updateReservationStatus: async (
        id: string,
        status: 'confirmed' | 'cancelled' | 'seated' | 'completed' | 'no_show',
        userId: string,
        reason?: string
    ): Promise<DiningReservation> => {
        return await api.put(`/partner/restaurant/reservations/${id}`, { status, reason }, getHeaders(userId))
    },

    // Menu
    getMenuItems: async (venueId: string, userId: string = ""): Promise<DiningMenuItem[]> => {
        const result = await api.get(`/partner/restaurant/menu?venue_id=${venueId}`, getHeaders(userId))
        if (Array.isArray(result)) return result
        if (result && Array.isArray(result.data)) return result.data
        return []
    },

    updateMenuItem: async (id: string, data: Partial<DiningMenuItem>, userId: string): Promise<DiningMenuItem> => {
        return await api.put(`/partner/restaurant/menu/${id}`, data, getHeaders(userId))
    },

    createMenuItem: async (venueId: string, data: Partial<DiningMenuItem>, userId: string): Promise<DiningMenuItem> => {
        return await api.post(`/partner/restaurant/menu`, { ...data, venue_id: venueId }, getHeaders(userId))
    },

    deleteMenuItem: async (id: string, userId: string): Promise<void> => {
        await api.delete(`/partner/restaurant/menu/${id}`, getHeaders(userId))
    },

    // Tables
    getTables: async (venueId: string, userId: string): Promise<any[]> => {
        const result = await api.get(`/partner/restaurant/tables?venue_id=${venueId}`, getHeaders(userId))
        if (Array.isArray(result)) return result
        if (result && Array.isArray(result.data)) return result.data
        return []
    },

    createTable: async (data: any, userId: string): Promise<any> => {
        return await api.post("/partner/restaurant/tables", data, getHeaders(userId))
    },

    updateTable: async (id: string, data: any, userId: string): Promise<any> => {
        return await api.put(`/partner/restaurant/tables/${id}`, data, getHeaders(userId))
    },

    deleteTable: async (id: string, userId: string): Promise<void> => {
        await api.delete(`/partner/restaurant/tables/${id}`, getHeaders(userId))
    }
}
