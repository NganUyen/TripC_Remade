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
        // First, try to fetch the user
        console.log("🔍 Looking for user in Supabase:", clerkUser.id);

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", clerkUser.id)
          .single();

        console.log("📊 Supabase query result:", {
          data,
          error,
          errorCode: error?.code,
        });

        if (error && error.code === "PGRST116") {
          // User doesn't exist in Supabase - create them automatically
          console.log("⚠️ User not found - creating in Supabase...");

          const response = await fetch("/api/sync-user", { method: "POST" });
          const result = await response.json();

          console.log("📝 Sync result:", result);

          if (result.success) {
            // Fetch the newly created user
            const { data: newUser } = await supabase
              .from("users")
              .select("*")
              .eq("clerk_id", clerkUser.id)
              .single();

            console.log("✅ User created successfully:", newUser);
            setSupabaseUser(newUser);
          } else {
            console.error(
              "❌ Failed to create user in Supabase:",
              result.error,
            );
            setSupabaseUser(null);
          }
        } else if (error) {
          console.error("❌ Error loading user from Supabase:", error);
          setSupabaseUser(null);
        } else {
          console.log("✅ User found in Supabase:", data.email);
          setSupabaseUser(data);
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setSupabaseUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (isClerkLoaded) {
      loadSupabaseUser();
    }

    // Listen for custom refresh events (e.g., after earning rewards)
    const handleRefresh = () => {
      console.log("🔄 User data refresh triggered via event");
      loadSupabaseUser();
    };

    window.addEventListener('user:refresh', handleRefresh);
    return () => window.removeEventListener('user:refresh', handleRefresh);
  }, [clerkUser, isClerkLoaded, supabase]);

  return {
    clerkUser,
    supabaseUser,
    isLoading: !isClerkLoaded || isLoading,
    isAuthenticated: !!clerkUser && !!supabaseUser,
  };
}
