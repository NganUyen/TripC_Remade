"use client";

import { useState } from "react";
import Link from "next/link";
import { UserProfileMenu } from "./UserProfileMenu";
import { BellButton } from "./notifications/BellButton";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-primary size-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">
                  travel_explore
                </span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
                TripC Pro
              </h2>
            </Link>
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400">
                    search
                  </span>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Search destinations, hotels, flights..."
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="#"
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
              <BellButton className="flex items-center justify-center size-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" />

              <SignedIn>
                <div className="relative">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "size-10 rounded-full ring-2 ring-transparent hover:ring-primary transition-all",
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold text-sm transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
