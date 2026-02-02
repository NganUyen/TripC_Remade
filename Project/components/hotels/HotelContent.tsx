"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Sun,
  CloudRain,
  Briefcase,
  Wifi,
  Waves,
  Wind,
  Utensils,
  Coffee,
  Gamepad2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { WeatherForecast } from "./WeatherForecast";

interface HotelContentProps {
  hotel: any;
}

export function HotelContent({ hotel }: HotelContentProps) {
  return (
    <div className="space-y-12">
      {/* Hotel Description */}
      {hotel?.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            About This Property
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {hotel.description}
          </p>
        </motion.div>
      )}

      {/* AI Insight Magic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] p-px bg-gradient-to-r from-orange-400 to-purple-500 shadow-xl"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[1.9rem] p-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="flex items-start gap-4 relatie z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-2">
                AI Insight: Perfect for Couples
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "Guests rave about the{" "}
                <span className="text-orange-500 font-bold">
                  Sunset Ocean Suites
                </span>{" "}
                for their privacy and direct beach access. The{" "}
                <span className="text-purple-500 font-bold">
                  Couples Spa Package
                </span>{" "}
                is highly recommended for rainy afternoons. Note that the main
                pool gets busy around 2 PM, so try the adult-only infinity pool
                for quiet time."
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather */}
        <WeatherForecast
          latitude={hotel.address?.lat || 10.8231}
          longitude={hotel.address?.lng || 106.6297}
        />

        {/* Packing List */}
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-6 border border-orange-100 dark:border-orange-800/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-500" />
              Smart Packing
            </h4>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Light
              rain jacket (Sunday)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
              Sunscreen & Hat (High UV)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Formal
              wear for Gala Dinner
            </li>
          </ul>
        </div>
      </div>

      {/* Amenities */}
      {hotel?.amenities && hotel.amenities.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Amenity Highlights
          </h3>
          <div className="flex flex-wrap gap-3">
            {hotel.amenities
              .slice(0, 12)
              .map((amenity: string, index: number) => {
                // Map amenity strings to icons
                const getAmenityIcon = (amenityName: string) => {
                  const name = amenityName.toLowerCase();
                  if (name.includes("wifi") || name.includes("internet"))
                    return <Wifi className="w-4 h-4" />;
                  if (name.includes("pool"))
                    return <Waves className="w-4 h-4 text-blue-500" />;
                  if (name.includes("restaurant") || name.includes("dining"))
                    return <Utensils className="w-4 h-4 text-orange-500" />;
                  if (name.includes("spa"))
                    return <Wind className="w-4 h-4 text-green-500" />;
                  if (name.includes("coffee") || name.includes("cafe"))
                    return <Coffee className="w-4 h-4 text-amber-700" />;
                  if (name.includes("kid") || name.includes("child"))
                    return <Gamepad2 className="w-4 h-4 text-purple-500" />;
                  return <Star className="w-4 h-4 text-slate-500" />;
                };

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Reviews */}
      {hotel?.reviews?.items && hotel.reviews.items.length > 0 && (
        <div id="reviews-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Guest Reviews
            </h3>
          </div>

          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">
                {hotel.reviews.average_rating?.toFixed(1) || "4.8"}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(hotel.reviews.average_rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-700"}`}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400">
                based on {hotel.reviews.count || 0} reviews
              </p>
            </div>
          </div>

          {/* Review Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {hotel.reviews.items.map((review: any) => (
              <div
                key={review.id}
                className="min-w-[300px] max-w-[350px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex-shrink-0"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                    {review.user_uuid ? review.user_uuid.substring(0, 2).toUpperCase() : "G"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Guest
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">
                      {review.overall_rating}
                    </span>
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{review.title}</h4>
                )}
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3 line-clamp-4">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
