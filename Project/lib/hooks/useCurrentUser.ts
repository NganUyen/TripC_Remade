"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : "skip",
  );

  return {
    clerkUser,
    convexUser,
    isLoaded,
    isAuthenticated: !!clerkUser,
  };
}
