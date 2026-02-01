"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  ArrowLeft,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react";
import { useEntertainmentSearch } from "@/lib/hooks/useEntertainmentAPI";
import { Footer } from "@/components/Footer";

export default function EntertainmentSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { items, total, loading } = useEntertainmentSearch(query, {
    limit: 20,
    type: filters.type || undefined,
    city: filters.city || undefined,
  });

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchInput.trim());
      if (filters.type) params.set("type", filters.type);
      if (filters.city) params.set("city", filters.city);
      router.push(`/entertainment/search?${params.toString()}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    params.set("q", query);
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.city) params.set("city", newFilters.city);
    router.push(`/entertainment/search?${params.toString()}`);
  };

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

            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Search Results
            </h1>
            {query && (
              <p className="text-slate-600 dark:text-slate-400">
                Showing {total} results for &ldquo;
                <span className="font-bold text-slate-900 dark:text-white">
                  {query}
                </span>
                &rdquo;
              </p>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for events, venues, shows..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#FF5E1F] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white hover:border-[#FF5E1F] transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-[#FF5E1F] text-white font-bold hover:bg-[#ff7640] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-zinc-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:border-[#FF5E1F] focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="event">Events</option>
                    <option value="venue">Venues</option>
                    <option value="show">Shows</option>
                    <option value="tour">Tours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    placeholder="Enter city..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#FF5E1F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      placeholder="Min"
                      className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#FF5E1F] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      placeholder="Max"
                      className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#FF5E1F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
                    className="bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          item.images?.[0] ||
                          "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase">
                        {item.type}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#FF5E1F] transition-colors">
                        {item.title}
                      </h3>

                      {item.subtitle && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.rating_average.toFixed(1)}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">
                              {item.location.city}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <span className="text-sm text-slate-500">From</span>
                        <span className="text-xl font-black text-[#FF5E1F]">
                          ${item.min_price}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No results found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search terms or filters
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
