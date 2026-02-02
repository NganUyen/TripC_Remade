"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function EntertainmentHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Rooftop Bars", slug: "rooftop-bars" },
    { name: "Nightclubs", slug: "nightclubs" },
    { name: "Live Music", slug: "live-music" },
    { name: "Speakeasies", slug: "speakeasies" },
    { name: "Lounges", slug: "lounges" },
    { name: "Pubs", slug: "pubs" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/entertainment/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/entertainment/category/${slug}`);
  };

  return (
    <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop"
          alt="Nightlife Atmosphere"
          className="w-full h-full object-cover opacity-90"
        />

        {/* MATCHED SHOP HERO GRADIENT: 
                    via-60% pushes the dark gradient up, ensuring the bottom is white/light 
                    so the category buttons below are readable in dark text.
                */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 via-60% to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center mt-6 md:mt-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white text-4xl md:text-5xl font-bold mb-8 text-center drop-shadow-md"
        >
          Nightlife &<br />
          Entertainment
        </motion.h1>

        {/* Search Console */}
        <form
          onSubmit={handleSearch}
          className="w-full relative z-20 px-2 md:px-0"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find karaoke rooms, rooftop bars, or clubs..."
              className="w-full h-14 pl-14 pr-6 rounded-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Categories List */}
        <div className="mt-6 w-full overflow-visible z-10 relative">
          <div className="flex justify-center gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
            {categories.map((cat, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => handleCategoryClick(cat.slug)}
                className="cursor-pointer whitespace-nowrap px-4 py-2 
                                bg-white/60 dark:bg-black/40 backdrop-blur-md 
                                border border-slate-200 dark:border-white/10 
                                rounded-full 
                                text-slate-900 dark:text-white 
                                text-sm font-bold 
                                hover:bg-white hover:scale-105 
                                transition-all shadow-sm"
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
