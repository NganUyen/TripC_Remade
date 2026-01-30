import { supabaseServerClient } from "../supabaseServerClient";
import type {
  BeautyVenue,
  CreateVenueRequest,
  VenueSearchParams,
  VenueListResponse,
} from "../types";

export class VenueService {
  private supabase = supabaseServerClient;

  async getVenueById(id: string): Promise<BeautyVenue | null> {
    const { data, error } = await this.supabase
      .from("beauty_venues")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching beauty venue:", error);
      return null;
    }
    return data as BeautyVenue;
  }

  async getVenueBySlug(slug: string): Promise<BeautyVenue | null> {
    const { data, error } = await this.supabase
      .from("beauty_venues")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching beauty venue by slug:", error);
      return null;
    }
    return data as BeautyVenue;
  }

  async searchVenues(params: VenueSearchParams): Promise<VenueListResponse> {
    let query = this.supabase
      .from("beauty_venues")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (params.city) query = query.eq("city", params.city);
    if (params.district) query = query.eq("district", params.district);
    if (params.categories?.length) query = query.overlaps("categories", params.categories);
    if (params.price_range) query = query.eq("price_range", params.price_range);
    if (params.min_rating) query = query.gte("average_rating", params.min_rating);
    if (params.is_featured) query = query.eq("is_featured", true);
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    query = query
      .order("is_featured", { ascending: false })
      .order("average_rating", { ascending: false })
      .order("created_at", { ascending: false });

    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error searching beauty venues:", error);
      return { venues: [], total: 0, limit, offset };
    }
    return {
      venues: (data ?? []) as BeautyVenue[],
      total: count ?? 0,
      limit,
      offset,
    };
  }

  async getFeaturedVenues(limit: number = 10): Promise<BeautyVenue[]> {
    const { data, error } = await this.supabase
      .from("beauty_venues")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("average_rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured beauty venues:", error);
      return [];
    }
    return (data ?? []) as BeautyVenue[];
  }

  async createVenue(venueData: CreateVenueRequest, ownerUserId?: string): Promise<BeautyVenue | null> {
    const slug = venueData.name
      ?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const { data, error } = await this.supabase
      .from("beauty_venues")
      .insert({ ...venueData, slug, owner_user_id: ownerUserId })
      .select()
      .single();

    if (error) {
      console.error("Error creating beauty venue:", error);
      return null;
    }
    return data as BeautyVenue;
  }

  async updateVenue(id: string, updates: Partial<CreateVenueRequest>): Promise<BeautyVenue | null> {
    const { data, error } = await this.supabase
      .from("beauty_venues")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating beauty venue:", error);
      return null;
    }
    return data as BeautyVenue;
  }

  async deleteVenue(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("beauty_venues")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting beauty venue:", error);
      return false;
    }
    return true;
  }
}

export const venueService = new VenueService();
