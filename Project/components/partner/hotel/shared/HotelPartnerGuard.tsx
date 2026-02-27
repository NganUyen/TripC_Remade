"use client";

import { useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useHotelPartnerStore } from "@/store/useHotelPartnerStore";
import { Clock, Ban, ShieldX, Hotel } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HotelPartnerGuardProps {
  children: ReactNode;
  requireApproved?: boolean;
  loadingSkeleton?: ReactNode;
}

// Default loading skeleton - matches the hotel portal structure
function DefaultSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="w-64 bg-[#1a1a1a] border-r border-white/5 fixed h-screen flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-5 h-5 rounded bg-white/10" />
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
          ))}
        </nav>
      </aside>
      {/* Content skeleton */}
      <main className="ml-64 flex-1 p-8 space-y-6">
        <div className="h-8 w-40 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/10 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/10 rounded-2xl" />
      </main>
    </div>
  );
}

export function HotelPartnerGuard({
  children,
  requireApproved = true,
  loadingSkeleton,
}: HotelPartnerGuardProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { partner, isLoading, fetchPartner } = useHotelPartnerStore();

  useEffect(() => {
    if (clerkLoaded && isSignedIn) {
      fetchPartner();
    }
  }, [clerkLoaded, isSignedIn, fetchPartner]);

  // Still loading
  if (!clerkLoaded || isLoading) {
    return loadingSkeleton || <DefaultSkeleton />;
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <ShieldX className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-400 mb-6">
            Please sign in to access the Hotel Partner Portal.
          </p>
          <Link
            href="/sign-in?redirect_url=/partner/hotel"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  // Not a hotel partner → show CTA to apply
  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Hotel className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Become a Hotel Partner
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            List your property on TripC and reach millions of travellers. Manage
            bookings, set rates, and grow your business — all from one portal.
          </p>
          <Link
            href="/partner/hotel/onboarding"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            Apply Now
          </Link>
        </motion.div>
      </div>
    );
  }

  // Pending
  if (requireApproved && partner.status === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Application Under Review
          </h2>
          <p className="text-slate-400 mb-4 leading-relaxed">
            Your hotel partner application for{" "}
            <strong className="text-slate-200">{partner.name}</strong> is being
            reviewed. We&apos;ll notify you once it&apos;s approved.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Review
          </div>
        </motion.div>
      </div>
    );
  }

  // Suspended
  if (partner.status === "suspended") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Ban className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Account Suspended
          </h2>
          <p className="text-slate-400 mb-2">
            Your hotel partner account has been suspended.
          </p>
          {partner.rejection_reason && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-xl p-4 mt-4">
              Reason: {partner.rejection_reason}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Banned
  if (partner.status === "banned") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Account Banned</h2>
          <p className="text-slate-400">
            Your hotel partner account has been permanently banned.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
