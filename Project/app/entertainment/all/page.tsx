"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

interface EntertainmentItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category_id: string;
  min_price: number;
  max_price: number;
  currency: string;
  images: string[];
  rating_average: number;
  rating_count: number;
  location: {
    city: string;
    country: string;
  };
}

export default function AllEntertainmentPage() {
  const [items, setItems] = useState<EntertainmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/entertainment/items?limit=50");
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse mb-4"></div>
            <div className="h-12 w-96 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/entertainment"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#FF5E1F] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Entertainment
          </Link>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
            All Entertainment
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover {items.length} amazing venues and experiences
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Link key={item.id} href={`/entertainment/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={
                    item.images?.[0] ||
                    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop"
                  }
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#FF5E1F] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                      From ${item.min_price}
                    </span>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">
                        {item.rating_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-sm line-clamp-1">
                    {item.subtitle}
                  </p>
                  <div className="flex items-center gap-1 text-slate-300 text-xs mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {item.location?.city}, {item.location?.country}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No entertainment items found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
