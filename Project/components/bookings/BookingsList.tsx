"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useBookings } from "@/lib/hooks/useBookings";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingsList() {
  const { isAuthenticated, isLoading } = useCurrentUser();
  const { bookings } = useBookings();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-subtle border border-slate-100 dark:border-slate-800">
            {/* Image Skeleton */}
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-6 space-y-4">
              {/* Title & Badge */}
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-2/3 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {/* Description lines */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
              </div>
              {/* Footer: Date & Price */}
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sign in to view your bookings
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Keep track of all your reservations in one place
        </p>
        <Link
          href="/sign-in"
          className="inline-flex px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          No bookings yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Start exploring and book your next adventure!
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold transition-colors"
        >
          Explore Now
        </Link>
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-subtle hover:shadow-depth transition-shadow"
        >
          {booking.image_url && (
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={booking.image_url}
                alt={booking.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {booking.title}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === "confirmed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : booking.status === "cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
              >
                {booking.status}
              </span>
            </div>
            {(booking.description || booking.location_summary) && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {booking.location_summary && (
                  <span className="block font-semibold mb-1">{booking.location_summary}</span>
                )}
                {booking.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-500">
                {new Date(booking.start_date).toLocaleDateString()}
              </div>
              <div className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: booking.currency || 'VND' }).format(booking.total_amount)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
