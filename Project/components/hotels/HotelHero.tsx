"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { SelectPopup } from "../ui/SelectPopup";
import { SimpleCalendar } from "../ui/SimpleCalendar";
import { CounterInput } from "../ui/CounterInput";
import { useRouter, useSearchParams } from "next/navigation";

export function HotelHero() {
  return (
    <section className="relative w-full pb-24">
      {/* Background & Mask */}
      <div className="absolute inset-0 h-[500px] w-full z-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Resort Pool"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-60% to-[#fcfaf8] dark:to-[#0a0a0a] opacity-90"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-40 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-sm">
              Find Your <span className="text-orange-500">Escape</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-sm">
              Discover exquisite stays and exclusive deals for your next
              getaway.
            </p>
          </motion.div>

          {/* Floating Search Console */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-50 w-full max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 p-2 rounded-[2rem] shadow-xl shadow-orange-500/5 mb-8"
          >
            <SearchWidget />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SearchWidget() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "destination" | "dates" | "guests" | null
  >(null);

  // Initialize from URL params if available
  const [destination, setDestination] = useState(
    searchParams.get("destination") || "",
  );

  // Guest State
  const [guests, setGuests] = useState({
    adults: Number(searchParams.get("adults")) || 2,
    children: Number(searchParams.get("children")) || 0,
    rooms: Number(searchParams.get("rooms")) || 1,
  });

  // Date State
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({
    from: searchParams.get("checkIn")
      ? new Date(searchParams.get("checkIn")!)
      : new Date(),
    to: searchParams.get("checkOut")
      ? new Date(searchParams.get("checkOut")!)
      : new Date(new Date().setDate(new Date().getDate() + 3)),
  });

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".search-widget-item")) {
        setActiveTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!destination) {
      alert("Please select a destination");
      return;
    }

    // Build search params
    const params = new URLSearchParams();
    params.set("destination", destination);
    params.set("adults", guests.adults.toString());
    params.set("children", guests.children.toString());
    params.set("rooms", guests.rooms.toString());

    if (dateRange.from) {
      params.set("checkIn", dateRange.from.toISOString().split("T")[0]);
    }
    if (dateRange.to) {
      params.set("checkOut", dateRange.to.toISOString().split("T")[0]);
    }

    // Navigate to hotels page with search params
    router.push(`/hotels?${params.toString()}`);
  };

  const updateGuests = (
    type: "adults" | "children" | "rooms",
    operation: "inc" | "dec",
  ) => {
    setGuests((prev) => {
      const newValue = operation === "inc" ? prev[type] + 1 : prev[type] - 1;
      if (newValue < 0) return prev; // prevent negative
      if (type === "adults" && newValue < 1) return prev; // at least 1 adult
      if (type === "rooms" && newValue < 1) return prev; // at least 1 room
      return { ...prev, [type]: newValue };
    });
  };

  const handleDateSelect = (range: {
    from: Date | undefined;
    to?: Date | undefined;
  }) => {
    setDateRange(range);
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "Select Dates";
    const fromStr = dateRange.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!dateRange.to) return fromStr;
    const toStr = dateRange.to.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${fromStr} - ${toStr}`;
  };

  const getNights = () => {
    if (!dateRange.from || !dateRange.to) return 0;
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700 relative">
      {/* Destination */}
      <div
        className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === "destination" ? "bg-white shadow-lg z-30" : "z-20"}`}
        onClick={() => setActiveTab("destination")}
      >
        <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 group-hover:scale-110 transition-transform">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Destination
          </p>
          {activeTab === "destination" ? (
            <input
              autoFocus
              type="text"
              placeholder="Where are you going?"
              className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300 outline-none"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          ) : (
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">
              {destination || "Where are you going?"}
            </h3>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate text-left">
            Popular coastal city
          </p>
        </div>

        {/* Dropdown */}
        {activeTab === "destination" && (
          <div className="absolute top-full left-0 w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            <p className="text-xs font-bold text-slate-400 px-4 py-2">
              POPULAR DESTINATIONS
            </p>
            {[
              "Hà Nội",
              "TP. Hồ Chí Minh",
              "Đà Nẵng",
              "Nha Trang",
              "Đà Lạt",
              "Vũng Tàu",
              "Phú Quốc",
              "Hội An",
            ].map((city) => (
              <div
                key={city}
                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between group/item"
                onClick={(e) => {
                  e.stopPropagation();
                  setDestination(city);
                  setActiveTab(null);
                }}
              >
                <span>{city}</span>
                <span className="opacity-0 group-hover/item:opacity-100 text-orange-500 text-xs">
                  Select
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dates */}
      <div
        className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === "dates" ? "bg-white shadow-lg z-30" : "z-20"}`}
        onClick={() => setActiveTab("dates")}
      >
        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110 transition-transform">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Check-in — Check-out
          </p>
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">
            {formatDateRange()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            {dateRange.to ? `${getNights()} nights` : "Select check-out"} •
            Weekend
          </p>
        </div>

        <SelectPopup
          isOpen={activeTab === "dates"}
          onClose={() => setActiveTab(null)}
          className="w-[340px]"
        >
          <SimpleCalendar
            mode="range"
            selectedRange={dateRange}
            onSelectRange={handleDateSelect}
            minDate={new Date()}
          />
        </SelectPopup>
      </div>

      {/* Guests */}
      <div
        className={`search-widget-item flex-1 p-4 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group relative ${activeTab === "guests" ? "bg-white shadow-lg z-30" : "z-20"}`}
        onClick={() => setActiveTab("guests")}
      >
        <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Guests
          </p>
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">
            {guests.adults} Adults, {guests.rooms} Room
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            {guests.children > 0
              ? `+ ${guests.children} Children`
              : "Standard Room"}
          </p>
        </div>

        {/* Guests Dropdown */}
        <SelectPopup
          isOpen={activeTab === "guests"}
          onClose={() => setActiveTab(null)}
          className="w-[280px]"
        >
          <div className="flex flex-col">
            <CounterInput
              label="Adults"
              subLabel="Ages 13+"
              value={guests.adults}
              onChange={(v) =>
                updateGuests("adults", v > guests.adults ? "inc" : "dec")
              }
              min={1}
            />
            <CounterInput
              label="Children"
              subLabel="Ages 2-12"
              value={guests.children}
              onChange={(v) =>
                updateGuests("children", v > guests.children ? "inc" : "dec")
              }
            />
            <CounterInput
              label="Rooms"
              subLabel="Max 4"
              value={guests.rooms}
              onChange={(v) =>
                updateGuests("rooms", v > guests.rooms ? "inc" : "dec")
              }
              min={1}
              max={4}
            />
          </div>
        </SelectPopup>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 size-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 z-50"
        >
          <Search className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Search Button */}
      <div className="lg:hidden p-2 pt-4">
        <button
          onClick={handleSearch}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Search Hotels
        </button>
      </div>
    </div>
  );
}
