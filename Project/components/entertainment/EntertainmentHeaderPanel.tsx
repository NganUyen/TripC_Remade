"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Star,
  Music,
  Film,
  Ticket,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { EntertainmentItemDetail } from "@/lib/hooks/useEntertainmentAPI";

interface EntertainmentHeaderPanelProps {
  item: EntertainmentItemDetail;
}

export function EntertainmentHeaderPanel({
  item,
}: EntertainmentHeaderPanelProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean;
    spotsLeft: number | null;
    message: string;
  } | null>(null);

  // Determine category icon based on type
  const getCategoryIcon = (type: string) => {
    if (type === "show") return Music;
    if (type === "event") return Film;
    return Ticket;
  };

  const CategoryIcon = getCategoryIcon(item.type);

  const handleCheckAvailability = async () => {
    setIsChecking(true);
    setAvailabilityStatus(null);

    try {
      // If item has sessions, check the first session's availability
      if (item.sessions && item.sessions.length > 0) {
        const session = item.sessions[0];
        const availableSpots = session.capacity - session.booked_count;

        if (availableSpots <= 0) {
          setAvailabilityStatus({
            available: false,
            spotsLeft: 0,
            message: "Sorry, this event is sold out!",
          });
        } else if (availableSpots <= 10) {
          setAvailabilityStatus({
            available: true,
            spotsLeft: availableSpots,
            message: `Only ${availableSpots} spots remaining! Book now!`,
          });
        } else {
          setAvailabilityStatus({
            available: true,
            spotsLeft: availableSpots,
            message: `Great! ${availableSpots} spots available.`,
          });
        }
      } else {
        // No sessions means general availability
        setAvailabilityStatus({
          available: true,
          spotsLeft: null,
          message: "Available! Ready to book.",
        });
      }

      // Scroll to booking widget
      setTimeout(() => {
        const bookingWidget = document.querySelector("[data-booking-widget]");
        if (bookingWidget) {
          bookingWidget.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus({
        available: false,
        spotsLeft: null,
        message: "Unable to check availability. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* LEFT: Meta Block */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <CategoryIcon className="w-3 h-3" /> {item.type}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-slate-900 dark:text-white">
                  {item.rating_average.toFixed(1)}
                </span>
                <span>({item.rating_count})</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {item.title}
            </h1>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {item.sessions && item.sessions.length > 0 && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Date
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {new Date(item.sessions[0].date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {item.sessions &&
                item.sessions.length > 0 &&
                item.sessions[0].start_time && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Time
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.sessions[0].start_time}
                      </p>
                    </div>
                  </div>
                )}
              {item.location && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Location
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {item.subtitle || item.title}
                    </p>
                    <p className="text-xs">
                      {item.location.city && item.location.country
                        ? `${item.location.city}, ${item.location.country}`
                        : item.location.city || item.location.country || ""}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    From
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ${item.min_price}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Availability Status */}
            {availabilityStatus && (
              <div
                className={`p-4 rounded-xl border-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  availabilityStatus.available
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                {availabilityStatus.available ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-bold text-sm ${
                      availabilityStatus.available
                        ? "text-green-900 dark:text-green-300"
                        : "text-red-900 dark:text-red-300"
                    }`}
                  >
                    {availabilityStatus.message}
                  </p>
                  {availabilityStatus.available &&
                    availabilityStatus.spotsLeft &&
                    availabilityStatus.spotsLeft <= 10 && (
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        🔥 Selling fast! Book before it's too late.
                      </p>
                    )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-2xl font-black text-primary">
                ${item.min_price}
              </span>
              <button
                onClick={handleCheckAvailability}
                disabled={isChecking}
                className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Availability"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Poster Image */}
        <div className="w-full lg:w-[400px] h-[300px] lg:h-auto relative bg-slate-100 dark:bg-slate-800">
          <img
            src={
              item.images?.[0] ||
              "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop"
            }
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
