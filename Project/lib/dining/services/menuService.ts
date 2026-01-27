// Menu service - handles menu and menu item operations
// Modular service layer for Dining menus

import { supabaseServerClient } from "../supabaseServerClient";
import type { DiningMenu, DiningMenuItem } from "../types";

export class MenuService {
  private supabase = supabaseServerClient;

  /**
   * Get all menus for a venue
   */
  async getVenueMenus(venueId: string): Promise<DiningMenu[]> {
    const { data, error } = await this.supabase
      .from("dining_menus")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching menus:", error);
      return [];
    }

    return (data || []) as DiningMenu[];
  }

  /**
   * Get menu items for a menu
   */
  async getMenuItems(menuId: string): Promise<DiningMenuItem[]> {
    const { data, error } = await this.supabase
      .from("dining_menu_items")
      .select("*")
      .eq("menu_id", menuId)
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }

    return (data || []) as DiningMenuItem[];
  }

  /**
   * Get all menu items for a venue (across all menus)
   */
  async getVenueMenuItems(venueId: string): Promise<DiningMenuItem[]> {
    const { data, error } = await this.supabase
      .from("dining_menu_items")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching venue menu items:", error);
      return [];
    }

    return (data || []) as DiningMenuItem[];
  }

  /**
   * Get featured menu items for a venue
   */
  async getFeaturedMenuItems(
    venueId: string,
    limit: number = 10,
  ): Promise<DiningMenuItem[]> {
    const { data, error } = await this.supabase
      .from("dining_menu_items")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_available", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured menu items:", error);
      return [];
    }

    return (data || []) as DiningMenuItem[];
  }
}

// Export singleton instance
export const menuService = new MenuService();
