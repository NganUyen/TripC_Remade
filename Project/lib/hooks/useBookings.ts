"use client";

import { useSupabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";


interface Booking {
  id: string;
  user_id: string;
  category:
  | "hotel"
  | "flight"
  | "restaurant"
  | "activity"
  | "event"
  | "wellness"
  | "beauty"
  | "transport";
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  total_amount: number;
  currency: string;
  image_url: string | null;
  location_summary: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

type NewBooking = Omit<Booking, "id" | "user_id" | "created_at" | "updated_at">;

/**
 * Hook to manage bookings with Supabase
 * Uses Clerk session token for authentication (RLS enforced)
 */
export function useBookings() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      try {
        // RLS automatically filters to current user's bookings
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();

    // Optional: Subscribe to realtime changes
    const channel = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          loadBookings();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const createBooking = async (booking: NewBooking) => {
    if (!user) throw new Error("Must be authenticated");

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...booking,
          user_id: user.id, // Explicitly set user_id from Clerk
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  const updateBooking = async (id: string, updates: Partial<NewBooking>) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error updating booking:", err);
      throw err;
    }
  };

  const updateStatus = async (id: string, status: Booking["status"]) => {
    return updateBooking(id, { status });
  };

  const cancelBooking = async (id: string) => {
    return updateStatus(id, "cancelled");
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting booking:", err);
      throw err;
    }
  };

  return {
    bookings,
    isLoading,
    createBooking,
    updateBooking,
    updateStatus,
    cancelBooking,
    deleteBooking,
  };
}
