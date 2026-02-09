"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Briefcase } from "lucide-react";
import { WeatherForecast } from "./WeatherForecast";

interface AIInsightsData {
  title: string;
  mainInsight: string;
  perfectFor: string[];
  highlights: string[];
  packingList: string[];
  bestTimeToVisit?: string;
  localTips?: string[];
}

interface AIInsightsProps {
  hotel: any;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  travelPurpose?: "leisure" | "business" | "family" | "romantic" | "solo";
}

export function AIInsights({
  hotel,
  checkIn,
  checkOut,
  guests = 2,
  travelPurpose = "leisure",
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchInsights() {
      if (!hotel || !hotel.name) {
        setError("Hotel information not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/hotels/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotel: {
              id: hotel.id,
              name: hotel.name,
              description: hotel.description,
              star_rating: hotel.star_rating,
              amenities: hotel.amenities,
              address: hotel.address,
              best_price: hotel.best_price,
            },
            checkIn,
            checkOut,
            guests,
            travelPurpose,
          }),
        });

        const data = await response.json();
        
        if (data.success && data.insights) {
          setInsights(data.insights);
          console.log("[AI Insights] Loaded for:", hotel.name);
        } else if (data.error) {
          console.error("AI insights error:", data.error);
          setError("Unable to generate insights");
        }
      } catch (err) {
        console.error("Failed to fetch AI insights:", err);
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [hotel?.id, hotel?.name, checkIn, checkOut, guests, travelPurpose]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] p-px bg-gradient-to-r from-orange-400 to-purple-500 shadow-xl"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[1.9rem] p-6 relative">
          <div className="flex items-center gap-3 justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              AI analyzing hotel features...
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !insights) {
    return null; // Gracefully hide if no insights
  }

  return (
    <div className="space-y-6">
      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] p-px bg-gradient-to-r from-orange-400 to-purple-500 shadow-xl"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[1.9rem] p-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-2">
                {insights.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                {insights.mainInsight}
              </p>

              {/* Perfect For Tags */}
              {insights.perfectFor && insights.perfectFor.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {insights.perfectFor.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 dark:from-orange-900/30 dark:to-purple-900/30 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {insights.highlights && insights.highlights.length > 0 && (
                <div className="space-y-2">
                  {insights.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 mt-2"></div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Best Time to Visit */}
              {insights.bestTimeToVisit && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800/30">
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                    💡 Pro Tip
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {insights.bestTimeToVisit}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Forecast */}
        <WeatherForecast
          latitude={hotel.address?.lat || 10.8231}
          longitude={hotel.address?.lng || 106.6297}
        />

        {/* Smart Packing */}
        {insights.packingList && insights.packingList.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-6 border border-orange-100 dark:border-orange-800/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                Smart Packing
              </h4>
            </div>
            <ul className="space-y-2">
              {insights.packingList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Local Tips - Full Width if available */}
      {insights.localTips && insights.localTips.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] p-6 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Local Insider Tips
            </h4>
          </div>
          <ul className="space-y-2">
            {insights.localTips.map((tip, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
