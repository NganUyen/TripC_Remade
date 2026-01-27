// Venue service - handles all venue-related database operations
// Modular service layer for Dining venues

import { createServerClient } from '@/lib/supabase'
import type { DiningVenue, CreateVenueRequest, VenueSearchParams, VenueListResponse } from '../types'

export class VenueService {
  private supabase = createServerClient()

  /**
   * Get a single venue by ID
   */
  async getVenueById(id: string): Promise<DiningVenue | null> {
    const { data, error } = await this.supabase
      .from('dining_venues')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching venue:', error)
      return null
    }

    return data as DiningVenue
  }

  /**
   * Get a venue by slug
   */
  async getVenueBySlug(slug: string): Promise<DiningVenue | null> {
    const { data, error } = await this.supabase
      .from('dining_venues')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching venue by slug:', error)
      return null
    }

    return data as DiningVenue
  }

  /**
   * Search and filter venues
   */
  async searchVenues(params: VenueSearchParams): Promise<VenueListResponse> {
    let query = this.supabase
      .from('dining_venues')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (params.city) {
      query = query.eq('city', params.city)
    }

    if (params.district) {
      query = query.eq('district', params.district)
    }

    if (params.cuisine_type && params.cuisine_type.length > 0) {
      query = query.contains('cuisine_type', params.cuisine_type)
    }

    if (params.price_range) {
      query = query.eq('price_range', params.price_range)
    }

    if (params.min_rating) {
      query = query.gte('average_rating', params.min_rating)
    }

    if (params.is_featured) {
      query = query.eq('is_featured', true)
    }

    // Text search
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }

    // Ordering
    query = query.order('is_featured', { ascending: false })
      .order('average_rating', { ascending: false })
      .order('created_at', { ascending: false })

    // Pagination
    const limit = params.limit || 20
    const offset = params.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error searching venues:', error)
      return {
        venues: [],
        total: 0,
        limit,
        offset,
      }
    }

    return {
      venues: (data || []) as DiningVenue[],
      total: count || 0,
      limit,
      offset,
    }
  }

  /**
   * Get featured venues
   */
  async getFeaturedVenues(limit: number = 10): Promise<DiningVenue[]> {
    const { data, error } = await this.supabase
      .from('dining_venues')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('average_rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured venues:', error)
      return []
    }

    return (data || []) as DiningVenue[]
  }

  /**
   * Create a new venue
   */
  async createVenue(venueData: CreateVenueRequest, ownerUserId?: string): Promise<DiningVenue | null> {
    // Generate slug if not provided
    const slug = venueData.name
      ?.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const { data, error } = await this.supabase
      .from('dining_venues')
      .insert({
        ...venueData,
        slug,
        owner_user_id: ownerUserId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating venue:', error)
      return null
    }

    return data as DiningVenue
  }

  /**
   * Update a venue
   */
  async updateVenue(id: string, updates: Partial<CreateVenueRequest>): Promise<DiningVenue | null> {
    const { data, error } = await this.supabase
      .from('dining_venues')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating venue:', error)
      return null
    }

    return data as DiningVenue
  }

  /**
   * Delete a venue (soft delete by setting is_active to false)
   */
  async deleteVenue(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('dining_venues')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting venue:', error)
      return false
    }

    return true
  }
}

// Export singleton instance
export const venueService = new VenueService()
