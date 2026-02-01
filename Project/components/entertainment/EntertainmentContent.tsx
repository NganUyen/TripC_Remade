"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Sun,
  CloudRain,
  Briefcase,
  MapPin,
  Clock,
  Ticket,
  Users,
  Accessibility,
  Star,
  Check,
  Camera,
  Music,
  Utensils,
  ShoppingBag,
  Wifi,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { EntertainmentItemDetail } from "@/lib/hooks/useEntertainmentAPI";
import { useEntertainmentReviews } from "@/lib/hooks/useEntertainmentAPI";
import { EntertainmentDetails } from "./EntertainmentDetails";

interface EntertainmentContentProps {
  item: EntertainmentItemDetail;
}

export function EntertainmentContent({ item }: EntertainmentContentProps) {
  const { reviews, summary } = useEntertainmentReviews(item.id, { limit: 5 });

  // Calculate rating distribution from summary
  const ratingDistribution = summary
    ? [
        { stars: 5, count: summary.distribution[5] || 0 },
        { stars: 4, count: summary.distribution[4] || 0 },
        { stars: 3, count: summary.distribution[3] || 0 },
        { stars: 2, count: summary.distribution[2] || 0 },
        { stars: 1, count: summary.distribution[1] || 0 },
      ]
    : [];

  // Map features to icons
  const featureIcons: Record<string, any> = {
    "Parking Available": MapPin,
    "Food & Drinks": Utensils,
    "Merchandise Shop": ShoppingBag,
    "LED Wristbands": Zap,
    "Photography Allowed": Camera,
    "Accessible Seating": Accessibility,
    WiFi: Wifi,
    "Air Conditioned": Sun,
    Restaurants: Utensils,
    "Souvenir Shops": ShoppingBag,
    "Character Meet & Greets": Users,
    "First Aid": Check,
    "Audio Guides": Music,
    "Cafe & Restaurant": Utensils,
    "Museum Shop": ShoppingBag,
    "Free WiFi": Wifi,
    "Bar/Concessions": Utensils,
    "Coat Check": Check,
    "Playbill Included": Ticket,
    "Gift Shop": ShoppingBag,
    "Big Screen Replays": Camera,
    "Family Section": Users,
    "Stroller Rental": Users,
  };

  return (
    <div className="space-y-12">
      {/* About This Event (Priority 1) */}
      <EntertainmentDetails item={item} />

      {/* AI Insight: Minimalist Editorial Style (Priority 2) */}
      {item.aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative pl-6 py-2 border-l-4 border-primary"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Insider Tip
            </span>
          </div>
          <p className="text-slate-900 dark:text-white text-lg md:text-xl font-medium leading-relaxed font-display italic">
            "{item.aiInsight}"
          </p>
        </motion.div>
      )}

      {/* Features Grid */}
      {(item.features || item.metadata?.features)?.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            What's Included
          </h3>
          <div className="flex flex-wrap gap-3">
            {(item.features || item.metadata?.features || []).map(
              (feature, i) => {
                const Icon = featureIcons[feature] || Check;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-default"
                  >
                    <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      {feature}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Accessibility */}
      {item.accessibility && item.accessibility.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/10 rounded-[2rem] p-6 border border-green-100 dark:border-green-800/30">
          <h4 className="font-bold text-green-900 dark:text-green-300 flex items-center gap-2 mb-4">
            <Accessibility
              className="w-5 h-5 text-green-600"
              strokeWidth={1.5}
            />
            Accessibility Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {item.accessibility.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Check
                  className="w-4 h-4 text-green-600 shrink-0"
                  strokeWidth={1.5}
                />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Guest Reviews
          </h3>
          <Link
            href="#"
            className="font-bold text-orange-500 hover:underline text-sm"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">
              {item.rating_average?.toFixed(1) || "0.0"}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400">
              based on {item.rating_count?.toLocaleString() || 0} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2 w-full max-w-sm">
            {ratingDistribution.map((rating) => (
              <div
                key={rating.stars}
                className="flex items-center gap-3 text-xs font-bold text-slate-500"
              >
                <span className="w-3">{rating.stars}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right">{rating.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        {reviews.length > 0 && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-[300px] p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={review.userImage}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {review.userName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {review.date} • {review.tripType}
                    </p>
                  </div>
                  <div className="ml-auto flex bg-white dark:bg-black/20 px-2 py-1 rounded-lg items-center gap-1">
                    <Star
                      className="w-3 h-3 text-yellow-400 fill-yellow-400"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                  {review.comment}
                </p>
                {review.verified && (
                  <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                    Verified Attendee
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
