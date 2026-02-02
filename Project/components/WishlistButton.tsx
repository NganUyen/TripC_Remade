"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { Heart } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState } from "react";

interface WishlistButtonProps {
  itemId: string;
  itemType: string;
  title: string;
  imageUrl?: string;
  price?: number;
  className?: string;
  initialInWishlist?: boolean;
}

export function WishlistButton({
  itemId,
  itemType,
  title,
  imageUrl,
  price,
  className = "",
  initialInWishlist = false,
}: WishlistButtonProps) {
  const { clerkUser, supabaseUser, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();
  const { isInWishlist, toggleWishlist, isLoading: isWishlistLoading } = useWishlist();
  const [isSyncing, setIsSyncing] = useState(false);

  // Use client-side state if loaded, otherwise fall back to server-provided initial state
  const isLoaded = !isUserLoading && !isWishlistLoading && !!supabaseUser;
  const inWishlist = isLoaded ? isInWishlist(itemId) : initialInWishlist;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!clerkUser) return;

    if (!supabaseUser) {
      toast.error("Profile not ready. Please wait a moment or refresh.");
      return;
    }

    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const added = await toggleWishlist({
        item_id: itemId,
        item_type: itemType,
        title,
        image_url: imageUrl || null,
        price: price ?? null
      });

      if (added) {
        toast.success(`Saved To collection`);
      } else {
        toast.info(`Removed From collection`);
      }
    } catch (error: any) {
      console.error("Wishlist error:", error);
      toast.error(error?.message || "Failed to update wishlist.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Determine the interactive state
  const isSyncingFinal = isSyncing || isUserLoading || isWishlistLoading;
  const canInteract = !isUserLoading && !!clerkUser && !!supabaseUser;

  // Render the heart icon with appropriate styling
  const renderHeart = () => (
    <Heart
      className={`w-5 h-5 transition-all ${inWishlist
        ? "fill-primary text-primary scale-110"
        : "text-slate-600 dark:text-slate-400 group-hover:text-primary group-hover:scale-110"
        } ${isSyncingFinal && !isLoaded ? "animate-pulse opacity-70" : ""}`}
    />
  );

  // If we are not loaded and don't have an initial state, show a generic loading pulse
  // This handles the "unknown" state consistently on server and client first render
  if (!isLoaded && !initialInWishlist && !clerkUser) {
    return (
      <div className={`flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}>
        <Heart className="w-5 h-5 text-slate-300" />
      </div>
    );
  }

  // If not authenticated (after loading), show the SignInButton wrapper
  if (!isUserLoading && !clerkUser) {
    return (
      <SignInButton mode="modal">
        <button
          onClick={(e) => e.stopPropagation()}
          className={`group flex items-center justify-center size-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all ${className}`}
        >
          {renderHeart()}
        </button>
      </SignInButton>
    );
  }

  // Default interactive button (handles loading/syncing within the button itself)
  return (
    <button
      onClick={handleToggle}
      disabled={isSyncingFinal && isLoaded} // Only disable if already loaded and performing a new sync
      className={`group flex items-center justify-center size-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all disabled:opacity-70 ${className}`}
    >
      {renderHeart()}
    </button>
  );
}
