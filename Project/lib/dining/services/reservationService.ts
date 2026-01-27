// Reservation service - handles dining reservation operations
// Modular service layer for Dining reservations

import { createServerClient } from '@/lib/supabase'
import type { DiningReservation, CreateReservationRequest } from '../types'

export class ReservationService {
  private supabase = createServerClient()

  /**
   * Create a new reservation
   */
  async createReservation(
    reservationData: CreateReservationRequest,
    userId: string
  ): Promise<DiningReservation | null> {
    const { data, error } = await this.supabase
      .from('dining_reservations')
      .insert({
        ...reservationData,
        user_id: userId,
        status: 'pending',
        duration_minutes: reservationData.duration_minutes || 120,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reservation:', error)
      return null
    }

    return data as DiningReservation
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: string): Promise<DiningReservation | null> {
    const { data, error } = await this.supabase
      .from('dining_reservations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching reservation:', error)
      return null
    }

    return data as DiningReservation
  }

  /**
   * Get reservation by code
   */
  async getReservationByCode(code: string): Promise<DiningReservation | null> {
    const { data, error } = await this.supabase
      .from('dining_reservations')
      .select('*')
      .eq('reservation_code', code)
      .single()

    if (error) {
      console.error('Error fetching reservation by code:', error)
      return null
    }

    return data as DiningReservation
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(userId: string, limit: number = 50): Promise<DiningReservation[]> {
    const { data, error } = await this.supabase
      .from('dining_reservations')
      .select('*')
      .eq('user_id', userId)
      .order('reservation_date', { ascending: false })
      .order('reservation_time', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user reservations:', error)
      return []
    }

    return (data || []) as DiningReservation[]
  }

  /**
   * Get venue reservations for a date
   */
  async getVenueReservationsByDate(
    venueId: string,
    date: string,
    status?: string
  ): Promise<DiningReservation[]> {
    let query = this.supabase
      .from('dining_reservations')
      .select('*')
      .eq('venue_id', venueId)
      .eq('reservation_date', date)
      .order('reservation_time', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching venue reservations:', error)
      return []
    }

    return (data || []) as DiningReservation[]
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(
    id: string,
    status: DiningReservation['status'],
    metadata?: Partial<DiningReservation>
  ): Promise<DiningReservation | null> {
    const updateData: any = { status }

    // Set timestamps based on status
    if (status === 'confirmed' && !metadata?.confirmed_at) {
      updateData.confirmed_at = new Date().toISOString()
    }
    if (status === 'seated' && !metadata?.seated_at) {
      updateData.seated_at = new Date().toISOString()
    }
    if (status === 'completed' && !metadata?.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }
    if (status === 'cancelled' && !metadata?.cancelled_at) {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('dining_reservations')
      .update({ ...updateData, ...metadata })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reservation:', error)
      return null
    }

    return data as DiningReservation
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string, reason?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('dining_reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', id)

    if (error) {
      console.error('Error cancelling reservation:', error)
      return false
    }

    return true
  }

  /**
   * Check availability for a time slot
   */
  async checkAvailability(
    venueId: string,
    date: string,
    time: string,
    guestCount: number
  ): Promise<{ available: boolean; reason?: string }> {
    // Check blocked dates
    const { data: blocked } = await this.supabase
      .from('dining_blocked_dates')
      .select('*')
      .eq('venue_id', venueId)
      .lte('start_date', date)
      .gte('end_date', date)

    if (blocked && blocked.length > 0) {
      return { available: false, reason: 'Venue is closed on this date' }
    }

    // Check existing reservations
    const { data: reservations } = await this.supabase
      .from('dining_reservations')
      .select('guest_count')
      .eq('venue_id', venueId)
      .eq('reservation_date', date)
      .eq('reservation_time', time)
      .in('status', ['pending', 'confirmed', 'seated'])

    const totalGuests = reservations?.reduce((sum, r) => sum + (r.guest_count || 0), 0) || 0

    // Get venue capacity
    const { data: venue } = await this.supabase
      .from('dining_venues')
      .select('capacity')
      .eq('id', venueId)
      .single()

    if (venue && venue.capacity && totalGuests + guestCount > venue.capacity) {
      return { available: false, reason: 'Not enough capacity' }
    }

    return { available: true }
  }
}

// Export singleton instance
export const reservationService = new ReservationService()
