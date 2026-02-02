"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Create a Supabase client that uses Clerk session token for authentication
 * Following Clerk's official integration guide:
 * https://clerk.com/docs/guides/development/integrations/databases/supabase
 */
export function useSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          // Inject Clerk session token into Supabase requests
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: "supabase",
            });

            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }

            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      },
    );
  }, [session]);

  return supabase;
}
