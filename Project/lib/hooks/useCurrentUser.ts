"use client";

import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface SupabaseUser {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  image_url: string | null;
  membership_tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  tcent_balance: number;
  tcent_pending: number;
  lifetime_spend: number;
  currency: string;
  language: string;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/**
 * Hook to get current user data from both Clerk and Supabase
 * Clerk provides authentication, Supabase provides extended profile data
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSupabaseUser() {
      if (!clerkUser) {
        setSupabaseUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", clerkUser.id)
          .single();

        if (error) {
          console.error("Error loading user from Supabase:", error);
          setSupabaseUser(null);
        } else {
          setSupabaseUser(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setSupabaseUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (isClerkLoaded) {
      loadSupabaseUser();
    }
  }, [clerkUser, isClerkLoaded, supabase]);

  return {
    clerkUser,
    supabaseUser,
    isLoading: !isClerkLoaded || isLoading,
    isAuthenticated: !!clerkUser && !!supabaseUser,
  };
}
