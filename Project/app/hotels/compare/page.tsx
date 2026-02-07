"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Suspense, useMemo, useEffect, useState } from "react";
import { hotels } from "../../../data/hotels";

interface Hotel {
  id: number;
  slug?: string;
  name: string;
  location: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  stars: number;
  image: string;
  priceOld: number;
  priceNew: number;
  badge: string | null;
  amenities: string[];
  wellness: number;
  roomSize: number;
  distance: number;
}

interface AIAnalysis {
  verdict: string;
  bestValue: string;
  bestRated: string;
  bestHotelName?: string; // Added for explicit hotel identification
  bestFor?: {
    families?: string;
    business?: string;
    luxury?: string;
    budget?: string;
  };
  insights?: string[];
  warnings?: string[];
  recommendation: string;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  // Fetch hotels from sessionStorage or API based on IDs
  useEffect(() => {
    const fetchHotels = async () => {
      const ids = idsParam
        ? idsParam.split(",").filter((id) => id.trim() !== "")
        : [];
      if (ids.length === 0) {
        setLoadingHotels(false);
        return;
      }

      setLoadingHotels(true);
      try {
        // TODO: Replace with actual database query
        // Should fetch from: /api/hotels with IDs or slugs
        // Query should include:
        // - SELECT hotels.*, AVG(reviews.rating) as average_rating, COUNT(reviews.id) as reviews_count
        // - FROM hotels LEFT JOIN hotel_reviews ON hotels.id = hotel_reviews.hotel_id
        // - WHERE hotels.id IN (ids) AND hotels.status = 'active'
        // - Also join hotel_rooms for room_size_sqm
        
        // First, try to get hotels from sessionStorage
        const storedHotels = sessionStorage.getItem("compareHotels");
        if (storedHotels) {
          const parsedHotels = JSON.parse(storedHotels);
          // Transform to match the expected Hotel interface
          const transformedHotels = parsedHotels.map(
            (hotel: any) =>
              ({
                id: hotel.id,
                slug: hotel.slug,
                name: hotel.name,
                location: hotel.location || hotel.address?.city || "Unknown",
                rating: hotel.rating || hotel.star_rating || 4,
                ratingLabel:
                  hotel.ratingLabel ||
                  getRatingLabel(hotel.rating || hotel.star_rating || 4),
                reviews: hotel.reviews || 0,
                stars: hotel.stars || hotel.star_rating || 4,
                image:
                  hotel.image ||
                  (hotel.images && hotel.images.length > 0
                    ? hotel.images[0].url || hotel.images[0]
                    : ""),
                priceOld:
                  hotel.priceOld ||
                  hotel.originalPrice ||
                  Math.round((hotel.price || hotel.priceNew || 100) * 1.3),
                priceNew: hotel.priceNew || hotel.price || 100,
                badge: hotel.badge || null,
                amenities: hotel.amenities || [],
                wellness: hotel.wellness || 8.0,
                roomSize: hotel.roomSize || 350,
                distance: hotel.distance || 1.0,
              }) as Hotel,
          );

          setSelectedHotels(transformedHotels);
          setLoadingHotels(false);
          return;
        }

        // Fallback: If no sessionStorage, fetch from mock data
        const mockHotelsData = hotels.filter((h: any) =>
          ids.includes(h.id.toString()),
        ) as Hotel[];
        setSelectedHotels(mockHotelsData);
      } catch (error) {
        console.error("Failed to load hotels:", error);
        setSelectedHotels([]);
      } finally {
        setLoadingHotels(false);
      }
    };

    fetchHotels();
  }, [idsParam]);

  // Helper function to get rating label
  const getRatingLabel = (rating: number): string => {
    if (rating >= 9) return "Exceptional";
    if (rating >= 8.5) return "Excellent";
    if (rating >= 8) return "Very Good";
    if (rating >= 7) return "Good";
    return "Pleasant";
  };

  // Fetch AI analysis when hotels are loaded
  useEffect(() => {
    if (!loadingHotels && selectedHotels.length >= 2) {
      fetchAIAnalysis();
    }
  }, [loadingHotels, selectedHotels]);

  const fetchAIAnalysis = async () => {
    setLoadingAI(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Transform hotels to match database schema before sending to AI
      const transformedHotels = selectedHotels.map(hotel => ({
        id: hotel.id?.toString() || hotel.slug || '',
        slug: hotel.slug,
        name: hotel.name,
        address: {
          city: hotel.location || 'Unknown'
        },
        star_rating: hotel.stars || 4,
        amenities: hotel.amenities || [],
        best_price: Math.round((hotel.priceNew || 100) * 100), // Convert to cents
        average_rating: hotel.rating || 8.0,
        reviews_count: hotel.reviews || 0
      }));

      const response = await fetch("/api/hotels/compare-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotels: transformedHotels }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        console.log("[AI Analysis] Received:", {
          bestHotelName: data.analysis.bestHotelName,
          verdict: data.analysis.verdict?.substring(0, 100) + "...",
        });
      } else if (data.error) {
        console.error("AI analysis error:", data.error);
        setAiAnalysis({
          verdict: "Unable to generate AI analysis at this time. Please compare hotels manually.",
          insights: [],
          warnings: [],
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("AI analysis request timed out");
        setAiAnalysis({
          verdict: "AI analysis timed out. Please try again or compare hotels manually.",
          insights: [],
          warnings: [],
        });
      } else {
        console.error("Failed to fetch AI analysis:", error);
        setAiAnalysis({
          verdict: "Unable to generate AI analysis. Please compare hotels manually.",
          insights: [],
          warnings: [],
        });
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // Show loading state while fetching hotels
  if (loadingHotels) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center p-6 md:p-12">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto"></div>
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-400">
              Loading hotels...
            </p>
          </div>
        </main>
      </>
    );
  }

  // Condition: If selected hotels are fewer than 2
  if (selectedHotels.length < 2) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center p-6 md:p-12 animate-fade-in-up">
          <div className="w-full max-w-4xl text-center space-y-12">
            <div className="relative w-36 h-36 mx-auto">
              <div className="absolute inset-0 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full scale-150 blur-3xl"></div>
              <svg
                className="w-full h-full relative z-10 text-brand-orange stroke-current stroke-[1.5]"
                fill="none"
                viewBox="0 0 100 100"
              >
                <path d="M20 85H80" strokeLinecap="round"></path>
                <rect height="50" rx="4" width="16" x="30" y="35"></rect>
                <line
                  strokeLinecap="round"
                  x1="34"
                  x2="42"
                  y1="45"
                  y2="45"
                ></line>
                <line
                  strokeLinecap="round"
                  x1="34"
                  x2="42"
                  y1="55"
                  y2="55"
                ></line>
                <line
                  strokeLinecap="round"
                  x1="34"
                  x2="42"
                  y1="65"
                  y2="65"
                ></line>
                <rect height="60" rx="4" width="16" x="54" y="25"></rect>
                <line
                  strokeLinecap="round"
                  x1="58"
                  x2="66"
                  y1="35"
                  y2="35"
                ></line>
                <line
                  strokeLinecap="round"
                  x1="58"
                  x2="66"
                  y1="45"
                  y2="45"
                ></line>
                <line
                  strokeLinecap="round"
                  x1="58"
                  x2="66"
                  y1="55"
                  y2="55"
                ></line>
                <line
                  strokeLinecap="round"
                  x1="58"
                  x2="66"
                  y1="65"
                  y2="65"
                ></line>
                <circle
                  className="dark:fill-slate-900"
                  cx="50"
                  cy="50"
                  fill="white"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></circle>
                <text
                  fill="currentColor"
                  fontSize="8"
                  fontWeight="800"
                  style={{ stroke: "none" }}
                  textAnchor="middle"
                  x="50"
                  y="53"
                >
                  VS
                </text>
              </svg>
            </div>
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                Compare Hotels
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
                Find your perfect stay. Select at least 2 hotels to compare
                amenities, prices, and verified ratings side by side.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/hotels"
                className="border-2 border-brand-orange text-brand-orange px-12 py-5 text-xl font-bold rounded-full inline-flex items-center space-x-4 group hover:bg-brand-orange hover:text-white hover:shadow-[0_10px_25px_-5px_rgba(255,94,31,0.3)] transition-all duration-300"
              >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span>Browse Hotels</span>
              </Link>
            </div>
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">
                  analytics
                </span>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Data Analysis
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Real-time pricing data from over 20+ global sources.
                </p>
              </div>
              <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">
                  verified
                </span>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Trusted Reviews
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Verified guest feedback and professional industry ratings.
                </p>
              </div>
              <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">
                  bolt
                </span>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Instant Compare
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Side-by-side technical breakdown in a single click.
                </p>
              </div>
            </div>
          </div>
        </main>
        <div className="fixed bottom-10 right-10 z-[100]">
          <button className="w-16 h-16 bg-brand-orange text-white rounded-full shadow-2xl shadow-brand-orange/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
            <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">
              chat_bubble
            </span>
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Determine Dynamic Winner Logic
  // AI Winner: Extract from AI analysis if available
  const getAIWinner = (): Hotel | null => {
    if (!aiAnalysis) return null;
    
    // Priority 1: Use explicit bestHotelName field if available
    if (aiAnalysis.bestHotelName) {
      const exactMatch = selectedHotels.find(h => 
        h.name.toLowerCase().trim() === aiAnalysis.bestHotelName?.toLowerCase().trim()
      );
      if (exactMatch) return exactMatch;
      
      // Fuzzy match if exact match fails
      const fuzzyMatch = selectedHotels.find(h => 
        h.name.toLowerCase().includes(aiAnalysis.bestHotelName?.toLowerCase() || '') ||
        aiAnalysis.bestHotelName?.toLowerCase().includes(h.name.toLowerCase())
      );
      if (fuzzyMatch) return fuzzyMatch;
    }
    
    // Priority 2: Try to extract hotel name from bestRated field
    const bestRatedName = aiAnalysis.bestRated;
    if (bestRatedName) {
      // Try each hotel to see if its name appears in the bestRated string
      for (const hotel of selectedHotels) {
        if (bestRatedName.toLowerCase().includes(hotel.name.toLowerCase())) {
          return hotel;
        }
      }
    }
    
    // Priority 3: Try to extract from verdict
    if (aiAnalysis.verdict) {
      for (const hotel of selectedHotels) {
        if (aiAnalysis.verdict.toLowerCase().includes(hotel.name.toLowerCase())) {
          return hotel;
        }
      }
    }
    
    return null;
  };

  const aiWinner = getAIWinner();
  
  // Log AI winner selection for debugging
  if (aiAnalysis && aiWinner) {
    console.log("[AI Winner] Selected:", aiWinner.name, "from AI analysis");
  } else if (aiAnalysis && !aiWinner) {
    console.warn("[AI Winner] Could not match AI recommendation to any hotel");
    console.warn("[AI Winner] Available hotels:", selectedHotels.map(h => h.name));
    console.warn("[AI Winner] AI bestHotelName:", aiAnalysis.bestHotelName);
  }
  
  // Fallback: Highest Rating if no AI winner
  const ratingWinner = selectedHotels.reduce(
    (prev, current) => (prev.rating > current.rating ? prev : current),
    selectedHotels[0],
  );
  
  // Use AI winner if available, otherwise use rating winner
  const winner = aiWinner || ratingWinner;

  // Best Value: Lowest Price
  const bestValue = selectedHotels.reduce(
    (prev, current) => (prev.priceNew < current.priceNew ? prev : current),
    selectedHotels[0],
  );

  const gridColsClass =
    selectedHotels.length === 2
      ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
      : selectedHotels.length === 3
        ? "grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto"
        : "grid-cols-1 md:grid-cols-4 max-w-[1400px] mx-auto";

  const imageSizeClasses = selectedHotels.length >= 4 ? "h-40" : "h-48";

  return (
    <>
      <main className="bg-slate-50 min-h-screen relative">
        {/* Back Button for Comparison View */}
        <div className="absolute top-6 left-6 z-[60]">
          <Link
            href="/hotels"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/20"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            <span className="text-xs tracking-widest uppercase">
              Back to Hotels
            </span>
          </Link>
        </div>

        <section className="relative h-[60vh] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <Image
            alt="Luxury Hotel Interior"
            fill
            className="object-cover"
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
            priority
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3C/svg%3E"
            onError={(e) => {
              console.warn("Hero image failed to load");
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
              Stay <span className="text-brand-orange">Better.</span>
            </h1>
            <p className="text-lg md:text-xl font-light max-w-2xl opacity-90">
              Expert-curated comparison for your next extraordinary escape.
            </p>
          </div>
        </section>

        <div className="relative z-50 -mt-24 px-8 lg:px-24">
          <div className="max-w-6xl mx-auto backdrop-blur-3xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-brand-orange">
                    auto_awesome
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                    AI Concierge Analysis
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                  The Verdict
                </h2>
                {loadingAI ? (
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-orange"></div>
                    <span>AI analyzing your options...</span>
                  </div>
                ) : aiAnalysis ? (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {aiAnalysis.verdict}
                  </p>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg italic">
                    "Based on data analysis,{" "}
                    <span className="font-bold text-slate-900 dark:text-white underline decoration-brand-orange underline-offset-4">
                      {winner.name}
                    </span>{" "}
                    emerges as the winner with a superior rating of{" "}
                    {winner.rating}, while{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {bestValue.name}
                    </span>{" "}
                    offers the best value at ${bestValue.priceNew}."
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  href={`/hotels/${winner.slug || winner.id}`}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:shadow-orange-500/40 transition-all shadow-xl shadow-orange-500/30 hover:scale-105"
                >
                  {aiWinner ? 'Book AI Winner' : 'Select Winner'}
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
                <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Share Report
                  <span className="material-symbols-outlined text-lg">
                    ios_share
                  </span>
                </button>
              </div>
            </div>

            {/* AI Insights Section */}
            {aiAnalysis && (aiAnalysis.insights || aiAnalysis.bestFor) && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                {aiAnalysis.bestFor && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-brand-orange">
                        category
                      </span>
                      Best For
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {aiAnalysis.bestFor.families && (
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 min-h-[140px] flex flex-col">
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                            👨‍👩‍👧‍👦 Families
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {aiAnalysis.bestFor.families}
                          </div>
                        </div>
                      )}
                      {aiAnalysis.bestFor.business && (
                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 min-h-[140px] flex flex-col">
                          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-2">
                            💼 Business
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {aiAnalysis.bestFor.business}
                          </div>
                        </div>
                      )}
                      {aiAnalysis.bestFor.luxury && (
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 min-h-[140px] flex flex-col">
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                            ✨ Luxury
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {aiAnalysis.bestFor.luxury}
                          </div>
                        </div>
                      )}
                      {aiAnalysis.bestFor.budget && (
                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 min-h-[140px] flex flex-col">
                          <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-2">
                            💰 Budget
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {aiAnalysis.bestFor.budget}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-brand-orange">
                        lightbulb
                      </span>
                      AI Insights
                    </h3>
                    <ul className="space-y-3">
                      {aiAnalysis.insights.map((insight, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                        >
                          <span className="text-brand-orange mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">
                        warning
                      </span>
                      Things to Consider
                    </h3>
                    <ul className="space-y-3">
                      {aiAnalysis.warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-amber-600 dark:text-amber-400"
                        >
                          <span className="mt-1">⚠️</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`py-20 px-4 md:px-8 lg:px-12`}>
          <div className={`grid ${gridColsClass} gap-8 mb-20`}>
            {selectedHotels.map((hotel) => {
              const isBestValue = hotel.id === bestValue.id;
              const isWinner = hotel.id === winner.id;

              return (
                <div key={hotel.id} className="flex flex-col h-full">
                  <div className="rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-2 mb-6 relative">
                    {isBestValue && (
                      <div className="absolute top-4 right-4 bg-brand-orange text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full z-20">
                        BEST VALUE
                      </div>
                    )}
                    {isWinner && !isBestValue && (
                      <div className="absolute top-4 right-4 bg-slate-900 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full z-20">
                        TOP RATED
                      </div>
                    )}
                    <div
                      className={`relative ${imageSizeClasses} w-full rounded-[2.5rem] overflow-hidden bg-slate-200 dark:bg-slate-800`}
                    >
                      <Image
                        alt={hotel.name}
                        fill
                        className="object-cover"
                        src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          console.warn(`Hotel image failed to load for ${hotel.name}`);
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-2 flex flex-col flex-1">
                    <span
                      className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${isBestValue ? "text-brand-orange" : "text-slate-400"}`}
                    >
                      {isBestValue ? "Our Top Pick" : hotel.ratingLabel}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight">
                      {hotel.name}
                    </h3>
                    <div className="flex items-end gap-1 mb-6">
                      <span
                        className={`text-3xl font-black ${isBestValue ? "text-brand-orange" : "text-slate-900 dark:text-white"}`}
                      >
                        ${hotel.priceNew}
                      </span>
                      <span className="text-sm font-medium text-slate-400 pb-1">
                        / Night
                      </span>
                    </div>
                    <ul className="space-y-4 mb-6">
                      <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <span className="text-sm text-slate-400 font-medium">
                          Wellness
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {hotel.wellness || "N/A"}/10
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <span className="text-sm text-slate-400 font-medium">
                          Room Size
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {hotel.roomSize || "N/A"} sqft
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <span className="text-sm text-slate-400 font-medium">
                          Distance
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {hotel.distance || "N/A"} mi
                        </span>
                      </li>
                    </ul>
                    <div className="mt-auto pt-4">
                      <Link
                        href={`/hotels/${hotel.slug || hotel.id}`}
                        className="w-full py-4 rounded-full font-bold text-xs tracking-widest uppercase text-center transition-all block bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:scale-105"
                      >
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-16 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-12 text-slate-400">
            <div className="flex flex-col items-center text-center gap-4">
              <span
                className="material-symbols-outlined text-slate-900 dark:text-white"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                wifi
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                High-Speed Connectivity
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <span
                className="material-symbols-outlined text-slate-900 dark:text-white"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                pool
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Infinity Pools Included
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <span
                className="material-symbols-outlined text-slate-900 dark:text-white"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                parking_valet
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Complimentary Valet
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <span
                className="material-symbols-outlined text-slate-900 dark:text-white"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              >
                workspace_premium
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Verified Luxury Standard
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading comparison...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
