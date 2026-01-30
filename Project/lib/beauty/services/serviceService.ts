import { supabaseServerClient } from "../supabaseServerClient";
import type { BeautyService, CreateServiceRequest } from "../types";

export class ServiceService {
  private supabase = supabaseServerClient;

  async getServiceById(id: string): Promise<BeautyService | null> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching beauty service:", error);
      return null;
    }
    return data as BeautyService;
  }

  async getVenueServices(venueId: string): Promise<BeautyService[]> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching venue services:", error);
      return [];
    }
    return (data ?? []) as BeautyService[];
  }

  async getFeaturedServices(venueId?: string, limit: number = 20): Promise<BeautyService[]> {
    let query = this.supabase
      .from("beauty_services")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (venueId) query = query.eq("venue_id", venueId);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching featured beauty services:", error);
      return [];
    }
    return (data ?? []) as BeautyService[];
  }

  async getTopRatedServices(limit: number = 10): Promise<BeautyService[]> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching top rated services:", error);
      return [];
    }
    return (data ?? []) as BeautyService[];
  }

  async getServicesListing(limit: number = 20): Promise<(BeautyService & { beauty_venues: { id: string; name: string; average_rating: number; review_count: number } | null })[]> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .select("*, beauty_venues(id, name, average_rating, review_count)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching services listing:", error);
      return [];
    }
    return (data ?? []) as (BeautyService & { beauty_venues: { id: string; name: string; average_rating: number; review_count: number } | null })[];
  }

  async createService(serviceData: CreateServiceRequest): Promise<BeautyService | null> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error("Error creating beauty service:", error);
      return null;
    }
    return data as BeautyService;
  }

  async updateService(id: string, updates: Partial<CreateServiceRequest>): Promise<BeautyService | null> {
    const { data, error } = await this.supabase
      .from("beauty_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating beauty service:", error);
      return null;
    }
    return data as BeautyService;
  }
}

export const serviceService = new ServiceService();
