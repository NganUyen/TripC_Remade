"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Wifi,
  Droplets,
  Utensils,
  Heart,
  ChevronRight,
  Share2,
  GitCompare,
  ArrowRightLeft,
  X,
  Check,
  Copy,
  Facebook,
  Twitter,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { AmenitiesChips } from "@/components/ui/AmenitiesChips";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";

import { hotels as mockHotels } from "@/data/hotels";
import { transformHotelData } from "@/lib/hotel/dataUtils";

interface Hotel {
  id: number;
  slug?: string;
  name: string;
  address?: any;
  star_rating?: number;
  description?: string;
  image?: string;
  images?: any[];
  amenities?: string[];
  policies?: any;
}

export function HotelList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedHotels, setSelectedHotels] = useState<number[]>([]);
  const [activeShareId, setActiveShareId] = useState<number | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const destination = searchParams.get("destination");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults");
  const children = searchParams.get("children");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const stars = searchParams.get("stars");
  const amenities = searchParams.get("amenities");

  // Count active filters
  const activeFilterCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (stars ? stars.split(",").length : 0) +
    (amenities ? amenities.split(",").length : 0);

  // Fetch hotels based on search params
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query params
        const params = new URLSearchParams();
        if (destination) params.set("city", destination);
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (stars) params.set("stars", stars);
        if (amenities) params.set("amenities", amenities);

        console.log("[HotelList] Fetching with params:", params.toString());

        const response = await fetch(`/api/hotels?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const result = await response.json();

        // Check if the API returned data
        if (!result.success || !result.data) {
          throw new Error("Invalid response from server");
        }

        // Use the data utility function to transform hotels
        const transformedHotels = transformHotelData(
          result.data,
          destination || "Vietnam",
        );

        console.log(
          `Fetched ${transformedHotels.length} hotels${destination ? " for " + destination : ""}`,
        );
        setHotels(transformedHotels);
        setTotalCount(transformedHotels.length);
        setDisplayCount(10); // Reset to show first 10 on new search
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch hotels");
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [destination, checkIn, checkOut, minPrice, maxPrice, stars, amenities]);

  // Handle outside click for share popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sharePopoverRef.current &&
        !sharePopoverRef.current.contains(event.target as Node)
      ) {
        setActiveShareId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCompare = (id: number) => {
    if (selectedHotels.includes(id)) {
      setSelectedHotels((prev) => prev.filter((hotelId) => hotelId !== id));
    } else {
      if (selectedHotels.length < 4) {
        setSelectedHotels((prev) => [...prev, id]);
      }
    }
  };

  const clearComparison = () => {
    setSelectedHotels([]);
  };

  const toggleShare = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeShareId === id) {
      setActiveShareId(null);
    } else {
      setActiveShareId(id);
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-24 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {loading ? (
            "Searching..."
          ) : (
            <>
              {hotels.length} {hotels.length === 1 ? "Property" : "Properties"}{" "}
              Found{" "}
              {destination && (
                <span className="text-slate-400 font-normal text-base ml-2">
                  in {destination}
                </span>
              )}
              {activeFilterCount > 0 && (
                <span className="text-orange-500 font-normal text-base ml-2">
                  • {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  applied
                </span>
              )}
            </>
          )}
        </h2>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span>Sort by:</span>
          <select className="bg-transparent border-none font-bold text-orange-500 focus:outline-none cursor-pointer">
            <option>Recommended</option>
            <option>Price: Low to High</option>
            <option>Rating: High to Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {!loading && hotels.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No hotels found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {activeFilterCount > 0
              ? "Try adjusting your filters to see more results"
              : "Try adjusting your search criteria"}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("minPrice");
                params.delete("maxPrice");
                params.delete("stars");
                params.delete("amenities");
                window.location.href = `/hotels?${params.toString()}`;
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {hotels.slice(0, displayCount).map((hotel, index) => {
        const isSelected = selectedHotels.includes(hotel.id);
        const isShareOpen = activeShareId === hotel.id;

        return (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-lg hover:shadow-xl hover:shadow-orange-500/5 transition-all w-full flex flex-col md:flex-row gap-4 md:h-[320px]"
          >
            {/* Image Section (Fixed 40% width, full height) */}
            <div className="w-full md:w-[40%] h-56 md:h-full relative overflow-hidden rounded-[1.5rem] shrink-0">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />

              {/* Badge Slot - Always present layout-wise but conditionally rendered content */}
              <div className="absolute top-4 left-4 z-10">
                {hotel.badge ? (
                  <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {hotel.badge}
                  </div>
                ) : (
                  <div className="h-7 w-20" /> /* Placeholder to maintain visual rhythm if needed, though absolute doesn't push content. User asked for "Badge occupies slot" - implied for visual consistency across cards if inline, but for absolute, consistent positioning is key. Kept absolute for now as per design image. */
                )}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10 w-full justify-end pointer-events-none">
                {/* Share Button & Popover */}
                <div className="relative pointer-events-auto">
                  <button
                    onClick={(e) => toggleShare(hotel.id, e)}
                    className={`size-10 rounded-xl backdrop-blur-md border border-white/30 flex items-center justify-center transition-all ${isShareOpen
                        ? "bg-white text-slate-900"
                        : "bg-white/20 text-white hover:bg-white hover:text-slate-900"
                      }`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {isShareOpen && (
                      <motion.div
                        ref={sharePopoverRef}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-[50]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-1">
                          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left">
                            <Copy className="w-4 h-4" /> Copy Link
                          </button>
                          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left">
                            <Facebook className="w-4 h-4" /> Facebook
                          </button>
                          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left">
                            <Twitter className="w-4 h-4" /> Twitter
                          </button>
                          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left">
                            <Mail className="w-4 h-4" /> Email
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Like Button */}
                <button className="size-10 pointer-events-auto rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details Section (Flex Column with justified spacing) */}
            <div className="flex-1 flex flex-col pt-2 pb-1 pr-2 md:pt-2 md:pb-2 md:pr-2 h-full">
              {/* Header Group: Title, Rating, Location */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>
                  {/* Strict Title Height: 2 lines max, fixed min-height */}
                  <Link href={`/hotels/${hotel.slug || hotel.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1 hover:text-orange-500 transition-colors line-clamp-2 min-h-[3rem] cursor-pointer">
                      {hotel.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                    {hotel.location} •{" "}
                    <span className="text-blue-500 hover:underline cursor-pointer">
                      Map
                    </span>
                  </p>
                </div>

                {/* Rating & Compare Group - Fixed Width */}
                <div className="hidden md:flex flex-col items-end gap-2 shrink-0 w-[140px]">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 pr-3 w-full justify-end">
                    <div className="bg-blue-600 text-white text-sm font-bold p-1.5 rounded-md min-w-[2.5rem] text-center">
                      {hotel.rating}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">
                        {hotel.ratingLabel}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                        {hotel.reviews} reviews
                      </p>
                    </div>
                  </div>

                  {/* Compare Button */}
                  <button
                    onClick={() => toggleCompare(hotel.id)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${isSelected
                        ? "bg-orange-50 text-[#FF5E1F] border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30"
                        : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      }`}
                  >
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center transition-colors ${isSelected
                          ? "bg-[#FF5E1F] border-[#FF5E1F]"
                          : "border-slate-300 dark:border-slate-600 bg-transparent"
                        }`}
                    >
                      {isSelected && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    {isSelected ? "Selected" : "Compare"}
                  </button>
                </div>
              </div>

              {/* Amenities Chips - Auto Layout with Popover */}
              <div className="mt-4 mb-2">
                <AmenitiesChips items={hotel.amenities} />
              </div>

              {/* Footer Section: Aligned to Bottom (mt-auto) */}
              <div className="mt-auto flex items-end justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <div className="md:hidden flex items-center gap-2">
                  <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {hotel.rating}
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {hotel.ratingLabel}
                  </span>
                </div>

                <div className="flex flex-col items-end ml-auto w-full md:w-auto">
                  {/* Price Stack - Fixed Height for normalized alignment */}
                  <div className="h-5 mb-1 flex justify-end w-full">
                    {hotel.priceOld ? (
                      <span className="text-sm text-slate-400 line-through font-medium leading-none">
                        {formatCurrency(hotel.priceOld, 'USD')}
                      </span>
                    ) : (
                      <span className="opacity-0 text-sm">
                        Placeholder
                      </span> /* Keeps height consistent */
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">
                      from
                    </span>
                    <span className="text-3xl font-black text-orange-500">
                      {formatCurrency(hotel.priceNew, 'USD')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /night
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {displayCount < totalCount && (
        <button
          onClick={() =>
            setDisplayCount((prev) => Math.min(prev + 10, totalCount))
          }
          className="w-full py-4 text-center text-slate-500 dark:text-slate-400 font-semibold hover:text-orange-500 transition-colors"
        >
          Show more results... ({displayCount} of {totalCount})
        </button>
      )}

      {/* Comparison Bar */}
      <AnimatePresence>
        {selectedHotels.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
                  <ArrowRightLeft className="w-5 h-5 text-[#FF5E1F]" />
                  {selectedHotels.length} of 4 hotels selected
                </div>

                <div className="hidden md:flex items-center gap-2">
                  {selectedHotels.map((id) => {
                    const hotel = hotels.find((h) => h.id === id);
                    if (!hotel) return null;
                    return (
                      <div key={id} className="relative group/thumb">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-slate-100 dark:border-slate-700"
                        />
                        <button
                          onClick={() => toggleCompare(id)}
                          className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-FULL left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/thumb:opacity-100 pointer-events-none transition-opacity truncate">
                          {hotel.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    // Store selected hotels data in sessionStorage for compare page
                    const hotelsToCompare = hotels.filter((h) =>
                      selectedHotels.includes(h.id),
                    );
                    sessionStorage.setItem(
                      "compareHotels",
                      JSON.stringify(hotelsToCompare),
                    );
                    router.push(
                      `/hotels/compare?ids=${selectedHotels.join(",")}`,
                    );
                  }}
                  className="px-6 py-2 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-lg shadow-orange-500/20"
                >
                  Compare ({selectedHotels.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
