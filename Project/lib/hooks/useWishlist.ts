"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";

export function useWishlist() {
  const { convexUser } = useCurrentUser();

  const wishlist = useQuery(
    api.wishlist.getUserWishlist,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  const isInWishlist = (itemId: string) => {
    return wishlist?.some((item) => item.itemId === itemId) ?? false;
  };

  const toggleWishlist = async (item: {
    itemType: string;
    itemId: string;
    title: string;
    imageUrl?: string;
    price?: number;
  }) => {
    if (!convexUser) return;

    const existingItem = wishlist?.find((w) => w.itemId === item.itemId);

    if (existingItem) {
      await removeFromWishlist({ wishlistId: existingItem._id });
    } else {
      await addToWishlist({
        userId: convexUser._id,
        ...item,
      });
    }
  };

  return {
    wishlist,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
  };
}
