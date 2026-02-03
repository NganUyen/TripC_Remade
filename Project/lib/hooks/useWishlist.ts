import { useWishlistContext } from "@/components/providers/WishlistProvider";

/**
 * Hook to manage wishlist with Supabase
 * Consumers now use the global state from WishlistProvider
 */
export function useWishlist() {
  const context = useWishlistContext();

  return {
    wishlist: context.wishlist,
    isLoading: context.isLoading,
    isInWishlist: context.isInWishlist,
    addToWishlist: context.addToWishlist,
    removeFromWishlist: context.removeFromWishlist,
    toggleWishlist: context.toggleWishlist,
    refreshWishlist: context.refreshWishlist,
  };
}
