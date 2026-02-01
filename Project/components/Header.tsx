"use client";

import { useState } from "react";
import Link from "next/link";
import { UserProfileMenu } from "./UserProfileMenu";
import { BellButton } from "./notifications/BellButton";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { CartIcon } from "@/components/shop/cart/CartIcon";
import { Globe } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function Header() {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-sync user to Supabase on first login
  useCurrentUser();

  return (
    <header className="sticky top-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="w-full px-6 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-primary size-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
                TripC Pro
              </h2>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/itinerary/create"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Plan Trip
              </Link>
              <Link
                href="/my-trips"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                My Trips
              </Link>
              <Link
                href="/rewards"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Rewards
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Support
              </Link>
              <Link
                href="/partner"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Partner
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="relative">
                <CartIcon />
              </div>
              <BellButton className="flex items-center justify-center size-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" />

              <SignedIn>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="size-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 ring-2 ring-transparent hover:ring-primary transition-all focus:outline-none"
                  >
                    <img
                      src={user?.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <UserProfileMenu
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                  />
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex items-center">
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-opacity">
                      <span className="material-symbols-outlined text-[20px]">
                        account_circle
                      </span>
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
