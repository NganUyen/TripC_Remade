"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Trash2,
  Eye,
  Sparkles,
  Plus,
  Clock,
  Search,
} from "lucide-react";
import { Itinerary } from "@/types/itinerary";

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Itinerary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    try {
      const saved = localStorage.getItem("saved_trips");
      if (saved) {
        const parsedTrips = JSON.parse(saved);
        setTrips(parsedTrips);
      }
    } catch (error) {
      console.error("Failed to load trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = (tripId: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      const updatedTrips = trips.filter((trip) => trip.id !== tripId);
      localStorage.setItem("saved_trips", JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
    }
  };

  const viewTrip = (tripId: string) => {
    router.push(`/itinerary/${tripId}`);
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-orange mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Loading your trips...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            My Trips
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            View and manage your saved travel itineraries
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips by destination or title..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => router.push("/itinerary/create")}
            className="px-8 py-4 bg-gradient-to-r from-brand-orange to-purple-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Create New Trip
          </button>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {searchQuery ? "No trips found" : "No saved trips yet"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Start planning your first adventure!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/itinerary/create")}
                className="px-8 py-4 bg-gradient-to-r from-brand-orange to-purple-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Trip
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                onClick={() => viewTrip(trip.id)}
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-brand-orange to-purple-500">
                  {trip.coverImage && (
                    <img
                      src={trip.coverImage}
                      alt={trip.destination}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {trip.isAIGenerated && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {trip.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {trip.description}
                  </p>

                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-brand-orange" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-brand-orange" />
                      <span>
                        {trip.numberOfDays} days • {trip.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4 text-brand-orange" />
                      <span>{trip.travelers.adults} adult(s)</span>
                    </div>
                    {trip.budget && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-4 h-4 text-brand-orange" />
                        <span>${trip.budget.total}</span>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <Clock className="w-3 h-3" />
                    <span>
                      Created {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-brand-orange text-slate-900 rounded-xl font-bold transition-all flex items-center gap-2 justify-center">
                      <Eye className="w-4 h-4" />
                      View Details
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrip(trip.id);
                      }}
                      className="px-4 py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
