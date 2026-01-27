// Cart service - handles dining cart operations for reservations
// Modular service layer for Dining cart

import { supabaseServerClient } from "../supabaseServerClient";

export interface CartItem {
  id: string;
  user_id: string;
  venue_id: string;
  venue_name?: string;
  venue_image?: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_requests?: string;
  occasion?: string;
  dietary_restrictions?: string[];
  table_id?: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCartItemRequest {
  venue_id: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_requests?: string;
  occasion?: string;
  dietary_restrictions?: string[];
  table_id?: string;
  duration_minutes?: number;
}

export class CartService {
  private supabase = supabaseServerClient;

  /**
   * Add item to cart
   */
  async addToCart(
    itemData: CreateCartItemRequest,
    userId: string,
  ): Promise<CartItem | null> {
    try {
      // Check if user already has this venue in cart for the same date/time
      const { data: existing } = await this.supabase
        .from("dining_cart")
        .select("id")
        .eq("user_id", userId)
        .eq("venue_id", itemData.venue_id)
        .eq("reservation_date", itemData.reservation_date)
        .eq("reservation_time", itemData.reservation_time)
        .single();

      if (existing) {
        // Update existing cart item
        return await this.updateCartItem(existing.id, itemData, userId);
      }

      // Get venue details
      const { data: venue } = await this.supabase
        .from("dining_venues")
        .select("name, cover_image_url")
        .eq("id", itemData.venue_id)
        .single();

      const { data, error } = await this.supabase
        .from("dining_cart")
        .insert({
          ...itemData,
          user_id: userId,
          venue_name: venue?.name,
          venue_image: venue?.cover_image_url,
          duration_minutes: itemData.duration_minutes || 120,
        })
        .select()
        .single();

      if (error) throw error;

      return data as CartItem;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return null;
    }
  }

  /**
   * Get user's cart
   */
  async getUserCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await this.supabase
      .from("dining_cart")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart:", error);
      return [];
    }

    return (data || []) as CartItem[];
  }

  /**
   * Get cart item count
   */
  async getCartCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("dining_cart")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Update cart item
   */
  async updateCartItem(
    cartItemId: string,
    updates: Partial<CreateCartItemRequest>,
    userId: string,
  ): Promise<CartItem | null> {
    const { data, error } = await this.supabase
      .from("dining_cart")
      .update(updates)
      .eq("id", cartItemId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating cart item:", error);
      return null;
    }

    return data as CartItem;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("dining_cart")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", userId);

    return !error;
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("dining_cart")
      .delete()
      .eq("user_id", userId);

    return !error;
  }

  /**
   * Convert cart items to reservations (checkout)
   */
  async checkoutCart(
    userId: string,
    guestInfo: {
      guest_name: string;
      guest_phone?: string;
      guest_email?: string;
    },
  ): Promise<{ success: boolean; reservations: string[]; errors: string[] }> {
    const cartItems = await this.getUserCart(userId);
    const reservations: string[] = [];
    const errors: string[] = [];

    for (const item of cartItems) {
      try {
        // Check availability
        const isAvailable = await this.checkAvailability(
          item.venue_id,
          item.reservation_date,
          item.reservation_time,
          item.guest_count,
        );

        if (!isAvailable) {
          errors.push(
            `Venue ${item.venue_name} is not available at ${item.reservation_time}`,
          );
          continue;
        }

        // Create reservation
        const { data: reservation, error } = await this.supabase
          .from("dining_reservations")
          .insert({
            user_id: userId,
            venue_id: item.venue_id,
            table_id: item.table_id,
            reservation_date: item.reservation_date,
            reservation_time: item.reservation_time,
            duration_minutes: item.duration_minutes,
            guest_count: item.guest_count,
            guest_name: guestInfo.guest_name,
            guest_phone: guestInfo.guest_phone,
            guest_email: guestInfo.guest_email,
            special_requests: item.special_requests,
            occasion: item.occasion,
            dietary_restrictions: item.dietary_restrictions,
            status: "pending",
            deposit_amount: 0,
            deposit_paid: false,
          })
          .select("id")
          .single();

        if (error) {
          errors.push(`Failed to create reservation for ${item.venue_name}`);
          continue;
        }

        reservations.push(reservation.id);

        // Remove from cart
        await this.removeFromCart(item.id, userId);
      } catch (error) {
        errors.push(`Error processing ${item.venue_name}`);
      }
    }

    return {
      success: reservations.length > 0,
      reservations,
      errors,
    };
  }

  /**
   * Check availability for a reservation
   */
  private async checkAvailability(
    venueId: string,
    date: string,
    time: string,
    guestCount: number,
  ): Promise<boolean> {
    // Check if venue is blocked on this date
    const { data: blockedDates } = await this.supabase
      .from("dining_blocked_dates")
      .select("*")
      .eq("venue_id", venueId)
      .lte("start_date", date)
      .gte("end_date", date);

    if (blockedDates && blockedDates.length > 0) {
      return false;
    }

    // Check capacity
    const { data: existingReservations } = await this.supabase
      .from("dining_reservations")
      .select("guest_count")
      .eq("venue_id", venueId)
      .eq("reservation_date", date)
      .eq("reservation_time", time)
      .in("status", ["pending", "confirmed", "seated"]);

    const { data: venue } = await this.supabase
      .from("dining_venues")
      .select("capacity")
      .eq("id", venueId)
      .single();

    if (!venue) return false;

    const currentGuests =
      existingReservations?.reduce((sum, r) => sum + r.guest_count, 0) || 0;
    const totalGuests = currentGuests + guestCount;

    return totalGuests <= venue.capacity;
  }
}

export const cartService = new CartService();
