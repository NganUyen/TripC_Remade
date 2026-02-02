"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Share2,
  Download,
  Clock,
  Navigation,
  Utensils,
  Home,
  Car,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Itinerary } from "@/types/itinerary";
import jsPDF from "jspdf";

export default function ItineraryViewPage() {
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const checkIfSaved = (tripId: string) => {
    const savedTrips = localStorage.getItem("saved_trips");
    if (savedTrips) {
      const trips = JSON.parse(savedTrips);
      const exists = trips.some((t: Itinerary) => t.id === tripId);
      setIsSaved(exists);
    }
  };

  const fetchItinerary = useCallback(async () => {
    try {
      const response = await fetch(`/api/itinerary/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setItinerary(data.itinerary);
        checkIfSaved(data.itinerary.id);
      }
    } catch (error) {
      console.error("Failed to fetch itinerary:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    // First try to get from sessionStorage (newly generated)
    const stored = sessionStorage.getItem("generated_itinerary");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.id === params.id) {
        setItinerary(data);
        setLoading(false);
        // Check if already saved
        checkIfSaved(data.id);
        return;
      }
    }

    // Check localStorage for saved trips
    const savedTrips = localStorage.getItem("saved_trips");
    if (savedTrips) {
      const trips = JSON.parse(savedTrips);
      const trip = trips.find((t: Itinerary) => t.id === params.id);
      if (trip) {
        setItinerary(trip);
        setIsSaved(true);
        setLoading(false);
        return;
      }
    }

    // Otherwise fetch from API
    fetchItinerary();
  }, [params.id, fetchItinerary]);

  const handleSave = async () => {
    if (!itinerary) return;

    try {
      const savedTrips = localStorage.getItem("saved_trips");
      let trips: Itinerary[] = savedTrips ? JSON.parse(savedTrips) : [];

      if (isSaved) {
        // Remove from saved
        trips = trips.filter((trip) => trip.id !== itinerary.id);
        localStorage.setItem("saved_trips", JSON.stringify(trips));
        setIsSaved(false);
      } else {
        // Add to saved
        trips.push(itinerary);
        localStorage.setItem("saved_trips", JSON.stringify(trips));
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to save trip:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary?.title,
          text: `Check out my trip to ${itinerary?.destination}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleExport = () => {
    if (!itinerary) return;

    const pdf = new jsPDF();
    let yPos = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to add text with wrapping
    const addText = (
      text: string,
      size: number,
      isBold: boolean = false,
      color: [number, number, number] = [0, 0, 0],
    ) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(...color);

      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += size * 0.4;
      });
      yPos += 3;
    };

    // Title
    addText(itinerary.title, 20, true, [255, 107, 0]);
    yPos += 5;
    if (itinerary.description) {
      addText(itinerary.description, 11, false, [100, 100, 100]);
    }
    yPos += 10;

    // Trip Details
    addText(`Destination: ${itinerary.destination}`, 12, true);
    addText(
      `Duration: ${itinerary.numberOfDays} days (${itinerary.startDate} to ${itinerary.endDate})`,
      11,
    );
    addText(`Travelers: ${itinerary.travelers.adults} adult(s)`, 11);
    if (itinerary.budget) {
      addText(`Budget: $${itinerary.budget.total}`, 11);
    }
    yPos += 10;

    // Days
    itinerary.days.forEach((day, dayIndex) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }

      // Day Header
      addText(`DAY ${day.day} - ${day.title}`, 14, true, [255, 107, 0]);
      addText(day.date, 10, false, [100, 100, 100]);
      if (day.description) {
        addText(day.description, 10, false, [60, 60, 60]);
      }
      yPos += 5;

      // Activities
      day.activities.forEach((activity, actIndex) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }

        addText(`${activity.time} - ${activity.title}`, 11, true);
        addText(activity.description, 10);
        addText(
          `Location: ${activity.location} | Duration: ${activity.duration} | Cost: $${activity.cost}`,
          9,
          false,
          [100, 100, 100],
        );

        if (activity.tips && activity.tips.length > 0) {
          activity.tips.forEach((tip) => {
            addText(`  - ${tip}`, 9, false, [150, 75, 0]);
          });
        }
        yPos += 3;
      });

      // Accommodation
      if (day.accommodation) {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        addText(`ACCOMMODATION: ${day.accommodation.name}`, 10, true);
        addText(
          `Check-in: ${day.accommodation.checkIn} | Check-out: ${day.accommodation.checkOut}`,
          9,
          false,
          [100, 100, 100],
        );
        yPos += 3;
      }

      // Meals
      if (day.meals) {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        if (day.meals.breakfast)
          addText(`Breakfast: ${day.meals.breakfast}`, 9);
        if (day.meals.lunch) addText(`Lunch: ${day.meals.lunch}`, 9);
        if (day.meals.dinner) addText(`Dinner: ${day.meals.dinner}`, 9);
        yPos += 3;
      }

      // Notes
      if (day.notes) {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        addText(`IMPORTANT NOTE: ${day.notes}`, 10, true, [200, 100, 0]);
      }

      yPos += 10;
    });

    // General Tips
    if (itinerary.tips && itinerary.tips.length > 0) {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      addText("TRAVEL TIPS", 14, true, [255, 107, 0]);
      itinerary.tips.forEach((tip) => {
        addText(`• ${tip}`, 10);
      });
    }

    // Save PDF
    pdf.save(`${itinerary.destination.replace(/\s+/g, "-")}-Itinerary.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Loading your itinerary...
          </p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Itinerary not found
          </p>
          <button
            onClick={() => router.push("/itinerary/create")}
            className="px-6 py-3 bg-brand-orange text-white rounded-full font-bold hover:shadow-lg transition-all"
          >
            Create New Itinerary
          </button>
        </div>
      </div>
    );
  }

  const currentDay = itinerary.days[selectedDay - 1];
  const totalBudget = itinerary.budget?.total || 0;
  const perDayBudget = totalBudget / itinerary.numberOfDays;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={
            itinerary.coverImage ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000"
          }
          alt={itinerary.destination}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button
            onClick={handleSave}
            className={`p-3 backdrop-blur-md rounded-full transition-all ${
              isSaved
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart
              className="w-5 h-5"
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            {itinerary.isAIGenerated && (
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                  AI Generated
                </span>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              {itinerary.title}
            </h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl">
              {itinerary.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{itinerary.destination}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                <Calendar className="w-4 h-4" />
                <span>{itinerary.numberOfDays} days</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                <Users className="w-4 h-4" />
                <span>
                  {itinerary.travelers.adults} adult
                  {itinerary.travelers.adults > 1 ? "s" : ""}
                </span>
              </div>
              {itinerary.budget && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                  <DollarSign className="w-4 h-4" />
                  <span>${totalBudget.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Day Selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-orange" />
                  Trip Days
                </h2>
                <div className="space-y-2">
                  {itinerary.days.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        selectedDay === day.day
                          ? "bg-brand-orange text-slate-900 shadow-lg scale-105"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-bold mb-1">Day {day.day}</div>
                      <div className="text-sm opacity-90">{day.title}</div>
                      <div className="text-xs opacity-75 mt-1">{day.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Breakdown */}
              {itinerary.budget && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Budget Overview
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Accommodation
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${itinerary.budget.accommodation}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Transportation
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${itinerary.budget.transportation}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Food
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${itinerary.budget.food}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Activities
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${itinerary.budget.activities}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Total
                      </span>
                      <span className="font-bold text-brand-orange text-lg">
                        ${totalBudget}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                      ~${Math.round(perDayBudget)}/day
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Day Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-brand-orange to-purple-500 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black text-slate-900">
                  Day {currentDay.day}
                </h2>
                <span className="text-slate-800">{currentDay.date}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">
                {currentDay.title}
              </h3>
              {currentDay.description && (
                <p className="text-slate-800">{currentDay.description}</p>
              )}
            </div>

            {/* Accommodation */}
            {currentDay.accommodation && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6 text-brand-orange" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Accommodation
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {currentDay.accommodation.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Check-in: {currentDay.accommodation.checkIn} • Check-out:{" "}
                      {currentDay.accommodation.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            <div className="space-y-4">
              {currentDay.activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() =>
                      setExpandedActivity(
                        expandedActivity === activity.id ? null : activity.id,
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {activity.time && (
                            <span className="flex items-center gap-1 text-brand-orange font-bold">
                              <Clock className="w-4 h-4" />
                              {activity.time}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                            {activity.category}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {activity.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4" />
                            {activity.location}
                          </span>
                          {activity.duration && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              {activity.duration}
                            </span>
                          )}
                          {activity.cost && activity.cost > 0 && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                              ${activity.cost}
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedActivity === activity.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedActivity === activity.id &&
                      activity.tips &&
                      activity.tips.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6"
                        >
                          <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-brand-orange" />
                            Tips
                          </h5>
                          <ul className="space-y-2">
                            {activity.tips.map((tip, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                              >
                                <span className="text-brand-orange mt-1">
                                  •
                                </span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Meals */}
            {currentDay.meals && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Utensils className="w-6 h-6 text-brand-orange" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Meals
                  </h3>
                </div>
                <div className="grid gap-4">
                  {currentDay.meals.breakfast && (
                    <div>
                      <div className="text-sm text-slate-500 mb-1">
                        Breakfast
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {currentDay.meals.breakfast}
                      </div>
                    </div>
                  )}
                  {currentDay.meals.lunch && (
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Lunch</div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {currentDay.meals.lunch}
                      </div>
                    </div>
                  )}
                  {currentDay.meals.dinner && (
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Dinner</div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {currentDay.meals.dinner}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Day Notes */}
            {currentDay.notes && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-yellow-900" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
                      Important Note
                      <span className="text-xs font-normal px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                        Day {currentDay.day}
                      </span>
                    </h4>
                    <div className="text-yellow-900 dark:text-yellow-100 leading-relaxed space-y-2">
                      {currentDay.notes
                        .split(".")
                        .filter((s) => s.trim())
                        .map((sentence, idx) => (
                          <p key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold mt-1">
                              •
                            </span>
                            <span>{sentence.trim()}.</span>
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* General Tips & Essentials */}
        {(itinerary.tips || itinerary.essentials) && (
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-brand-orange" />
                  Travel Tips
                </h3>
                <ul className="space-y-4">
                  {itinerary.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-brand-orange text-xl">•</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.essentials && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-brand-orange" />
                  Travel Essentials
                </h3>
                <div className="space-y-4">
                  {itinerary.essentials.visa && (
                    <div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Visa
                      </div>
                      <div className="text-slate-900 dark:text-white">
                        {itinerary.essentials.visa}
                      </div>
                    </div>
                  )}
                  {itinerary.essentials.currency && (
                    <div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Currency
                      </div>
                      <div className="text-slate-900 dark:text-white">
                        {itinerary.essentials.currency}
                      </div>
                    </div>
                  )}
                  {itinerary.essentials.language && (
                    <div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Language
                      </div>
                      <div className="text-slate-900 dark:text-white">
                        {itinerary.essentials.language}
                      </div>
                    </div>
                  )}
                  {itinerary.essentials.weather && (
                    <div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Weather
                      </div>
                      <div className="text-slate-900 dark:text-white">
                        {itinerary.essentials.weather}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
