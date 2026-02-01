"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Music, Ticket, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  base_price: number;
  currency: string;
  images: string[];
  rating_average: number;
  total_bookings: number;
  is_featured: boolean;
}

export function TrendingBento() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsToday, setBookingsToday] = useState(500);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/entertainment/trending?limit=4");
        const data = await response.json();
        setTrending(data.items || []);
        // Calculate approximate bookings from data
        if (data.items?.length) {
          const total = data.items.reduce(
            (sum: number, item: TrendingItem) =>
              sum + (item.total_bookings || 0),
            0,
          );
          setBookingsToday(
            Math.floor(total * 0.1) + Math.floor(Math.random() * 100),
          );
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-3xl font-black text-[#1c140d] dark:text-white mb-8">
          Trending this week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          <div className="md:col-span-2 h-[300px] bg-slate-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse"></div>
          <div className="space-y-6">
            <div className="h-[140px] bg-slate-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse"></div>
            <div className="h-[140px] bg-slate-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse"></div>
            <div className="h-[140px] bg-slate-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const [featuredItem, secondItem, thirdItem, fourthItem] = trending;

  return (
    <section>
      <h2 className="text-3xl font-black text-[#1c140d] dark:text-white mb-8">
        Trending this week
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Row 1: Card 1 - Featured Item (Electric Pulse) */}
        {featuredItem ? (
          <Link href={`/entertainment/${featuredItem.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer"
            >
              <img
                src={
                  featuredItem.images?.[0] ||
                  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop"
                }
                alt={featuredItem.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    Top Rated
                  </span>
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    ⭐ {featuredItem.rating_average.toFixed(1)}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                  {featuredItem.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-slate-300 font-medium line-clamp-1 max-w-md">
                    {featuredItem.subtitle}
                  </p>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white text-purple-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  🔥 Trending
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                Discover Amazing Nightlife
              </h3>
              <p className="text-slate-200 font-medium">
                Exclusive venues, unforgettable experiences
              </p>
            </div>
          </motion.div>
        )}

        {/* Row 1: Card 2 - Second Item (Sunset Cruise) */}
        {secondItem ? (
          <Link href={`/entertainment/${secondItem.id}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer"
            >
              <img
                src={
                  secondItem.images?.[0] ||
                  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop"
                }
                alt={secondItem.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    Trending
                  </span>
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    ⭐ {secondItem.rating_average.toFixed(1)}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1 leading-tight line-clamp-2">
                  {secondItem.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-slate-200 text-sm font-medium">
                    From ${secondItem.base_price || secondItem.min_price}
                  </p>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer bg-gradient-to-br from-pink-500 to-rose-600"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <Music className="absolute right-6 top-6 w-24 h-24 text-white/10 rotate-12" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white text-rose-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  🎵 Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-1 leading-tight">
                Rooftop Jazz Nights
              </h3>
              <p className="text-slate-200 text-sm font-medium">
                Live performances under the stars
              </p>
            </div>
          </motion.div>
        )}

        {/* Row 2: Card 3 - Fourth Item (Craft Beer) - Large Format */}
        {fourthItem ? (
          <Link href={`/entertainment/${fourthItem.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer"
            >
              <img
                src={
                  fourthItem.images?.[0] ||
                  "https://images.unsplash.com/photo-1436076863939-06870fe779c2?q=80&w=2000&auto=format&fit=crop"
                }
                alt={fourthItem.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    Hot Pick
                  </span>
                  <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    ⭐ {fourthItem.rating_average.toFixed(1)}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                  {fourthItem.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-slate-300 font-medium line-clamp-1 max-w-md">
                    {fourthItem.subtitle}
                  </p>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 relative h-full min-h-[300px] rounded-[2rem] overflow-hidden group cursor-pointer bg-gradient-to-br from-amber-500 to-orange-600"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <Music className="absolute right-8 top-8 w-32 h-32 text-white/10 rotate-12" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white text-orange-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  🌟 Featured
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                Live Jazz Sessions
              </h3>
              <p className="text-slate-200 font-medium">
                Intimate performances nightly
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
