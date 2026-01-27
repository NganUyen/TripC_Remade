"use client";

import { useSupabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface WishlistItem {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  title: string;
  image_url: string | null;
  price: number | null;
  created_at: string;
}

type NewWishlistItem = Omit<WishlistItem, "id" | "user_id" | "created_at">;

/**
 * Hook to manage wishlist with Supabase
 * Uses Clerk session token for authentication (RLS enforced)
 */
export function useWishlist() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setWishlist([]);
        setIsLoading(false);
        return;
      }

      try {
        // RLS automatically filters to current user's wishlist
        const { data, error } = await supabase
          .from("wishlist")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setWishlist(data || []);
      } catch (err) {
        console.error("Error loading wishlist:", err);
        setWishlist([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadWishlist();

    // Optional: Subscribe to realtime changes
    const channel = supabase
      .channel("wishlist_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishlist",
        },
        () => {
          loadWishlist();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const isInWishlist = (itemId: string) => {
    return wishlist.some((item) => item.item_id === itemId);
  };

  const addToWishlist = async (item: NewWishlistItem) => {
    if (!user) throw new Error("Must be authenticated");

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          ...item,
          user_id: user.id, // Explicitly set user_id from Clerk
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      throw err;
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("item_id", itemId);

      if (error) throw error;
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      throw err;
    }
  };

  const toggleWishlist = async (item: NewWishlistItem) => {
    if (isInWishlist(item.item_id)) {
      await removeFromWishlist(item.item_id);
      return false; // Removed
    } else {
      await addToWishlist(item);
      return true; // Added
    }
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };
}
