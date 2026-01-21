"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { Heart } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

interface WishlistButtonProps {
  itemId: string;
  itemType: string;
  title: string;
  imageUrl?: string;
  price?: number;
  className?: string;
}

export function WishlistButton({
  itemId,
  itemType,
  title,
  imageUrl,
  price,
  className = "",
}: WishlistButtonProps) {
  const { isAuthenticated } = useCurrentUser();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(itemId);

  if (!isAuthenticated) {
    return (
      <SignInButton mode="modal">
        <button
          className={`group flex items-center justify-center size-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all ${className}`}
        >
          <Heart className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      onClick={() =>
        toggleWishlist({ itemId, itemType, title, imageUrl, price })
      }
      className={`group flex items-center justify-center size-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          inWishlist
            ? "fill-primary text-primary scale-110"
            : "text-slate-600 dark:text-slate-400 group-hover:text-primary group-hover:scale-110"
        }`}
      />
    </button>
  );
}
