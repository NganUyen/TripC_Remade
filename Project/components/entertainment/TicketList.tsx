"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapPin, Calendar, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EntertainmentItem {
  id: string;
  title: string;
  subtitle: string;
  location: any;
  min_price: number;
  currency: string;
  images: string[];
  type: string;
}

export function TicketList() {
  const [items, setItems] = useState<EntertainmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          "/api/entertainment/items?limit=6&sort=popular",
        );
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
    scrollContainerRef.current.style.scrollBehavior = "auto";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Reduced sensitivity from 2 to 1

    // Mark as dragged if moved more than 5px
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "auto";
    }

    // Reset hasDragged after a longer delay to ensure click handler sees it
    setTimeout(() => setHasDragged(false), 200);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
        scrollContainerRef.current.style.userSelect = "auto";
      }
      setTimeout(() => setHasDragged(false), 200);
    }
  };

  if (loading) {
    return (
      <section className="pb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-[#1c140d] dark:text-white">
            Hot Tickets
          </h3>
          <button className="text-[#FF5E1F] text-sm font-bold flex items-center gap-1">
            View Calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[340px] md:w-[400px] h-[160px] bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-[#1c140d] dark:text-white">
          Hot Tickets
        </h3>
        <Link
          href="/entertainment/calendar"
          className="text-[#FF5E1F] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
        >
          View Calendar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 lg:-mx-12 lg:px-12 no-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: "auto" }}
      >
        {items.map((ticket, i) => (
          <Link
            key={ticket.id}
            href={`/entertainment/${ticket.id}`}
            className="shrink-0 w-[340px] md:w-[400px] block"
            onClick={(e) => {
              if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden relative h-full"
            >
              {/* Left: Image Area */}
              <div className="w-1/3 relative">
                <img
                  src={
                    ticket.images?.[0] ||
                    "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Perforation Line */}
              <div className="relative w-[1px] h-full">
                <div className="absolute top-0 bottom-0 left-[-1px] w-[2px] border-r-2 border-dashed border-slate-200 dark:border-zinc-700"></div>
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-10"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-10"></div>
              </div>

              {/* Right: Details */}
              <div className="w-2/3 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                    {ticket.title}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {ticket.type === "tour"
                          ? "Daily Tours"
                          : ticket.type === "show"
                            ? "Multiple Shows"
                            : "Check Availability"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">
                        {typeof ticket.location === "object"
                          ? `${ticket.location.city || ""}, ${ticket.location.country || ""}`
                          : ticket.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-[#FF5E1F] font-black text-xl">
                    ${ticket.min_price}
                  </div>
                  <button className="bg-[#FF5E1F] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#ff7640] transition-colors">
                    Book
                  </button>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* View All Card */}
        <Link
          href="/entertainment/all"
          className="shrink-0 w-[150px] flex items-center justify-center"
        >
          <button className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
        </Link>
      </div>
    </section>
  );
}
