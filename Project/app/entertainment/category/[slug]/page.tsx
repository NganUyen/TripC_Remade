"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, SlidersHorizontal } from "lucide-react";
import { useEntertainmentItems } from "@/lib/hooks/useEntertainmentAPI";
import { Footer } from "@/components/Footer";

// Map category slugs to display names
const CATEGORY_NAMES: Record<string, string> = {
  "rooftop-bars": "Rooftop Bars",
  nightclubs: "Nightclubs",
  "live-music": "Live Music",
  speakeasies: "Speakeasies",
  lounges: "Lounges",
  pubs: "Pubs",
};

export default function EntertainmentCategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const categoryName =
    CATEGORY_NAMES[slug] ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const { items, total, loading } = useEntertainmentItems({
    category: slug,
    limit: 20,
    sort: "popular",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/entertainment"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#FF5E1F] mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Entertainment
            </Link>

            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
              {categoryName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discover {total} amazing {categoryName.toLowerCase()} experiences
            </p>
          </div>

          {/* Hero Banner (optional) */}
          <div className="relative h-64 rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <h2 className="text-4xl font-black text-white mb-3">
                  Explore {categoryName}
                </h2>
                <p className="text-white/90 text-lg">
                  Unforgettable nightlife & entertainment experiences
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/entertainment/${item.id}`}
                    className="group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={
                            item.images?.[0] ||
                            "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-[#FF5E1F] rounded-full text-white text-xs font-bold uppercase">
                          {item.type}
                        </div>

                        {/* Featured Badge */}
                        {item.is_featured && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 rounded-full text-slate-900 text-xs font-bold uppercase">
                            Featured
                          </div>
                        )}

                        {/* Rating Overlay */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.rating_average.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({item.rating_count})
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#FF5E1F] transition-colors">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {item.subtitle}
                          </p>
                        )}

                        {item.location && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">
                              {item.location.city && item.location.country
                                ? `${item.location.city}, ${item.location.country}`
                                : item.location.city ||
                                  item.location.country ||
                                  ""}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                          <div>
                            <span className="text-xs text-slate-500">From</span>
                            <div className="text-2xl font-black text-[#FF5E1F]">
                              ${item.min_price}
                            </div>
                          </div>
                          <button className="px-5 py-2 bg-[#FF5E1F] text-white rounded-full text-sm font-bold hover:bg-[#ff7640] transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Load More (if needed) */}
              {items.length < total && (
                <div className="text-center mt-12">
                  <button className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-full font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No {categoryName.toLowerCase()} found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Check back later for new experiences
              </p>
              <Link
                href="/entertainment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5E1F] text-white font-bold rounded-full hover:bg-[#ff7640] transition-colors"
              >
                Browse All Entertainment
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
