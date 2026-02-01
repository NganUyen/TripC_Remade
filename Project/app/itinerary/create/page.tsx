"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Sparkles,
  MapPin,
  Heart,
  ShoppingBag,
  Camera,
  Utensils,
  Mountain,
  Plane,
} from "lucide-react";

const INTERESTS = [
  { id: "culture", label: "Culture & History", icon: "🏛️" },
  { id: "food", label: "Food & Dining", icon: "🍽️" },
  { id: "adventure", label: "Adventure", icon: "🏔️" },
  { id: "relaxation", label: "Relaxation", icon: "🧘" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "nightlife", label: "Nightlife", icon: "🎉" },
  { id: "nature", label: "Nature & Wildlife", icon: "🌿" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "art", label: "Art & Museums", icon: "🎨" },
  { id: "sports", label: "Sports & Activities", icon: "⚽" },
];

const TRAVEL_STYLES = [
  { id: "backpacker", label: "Backpacker", desc: "Budget-friendly adventures" },
  { id: "luxury", label: "Luxury", desc: "Premium experiences" },
  { id: "family", label: "Family-Friendly", desc: "Great for all ages" },
  { id: "romantic", label: "Romantic", desc: "Perfect for couples" },
  { id: "solo", label: "Solo Travel", desc: "Independent explorer" },
  { id: "group", label: "Group Travel", desc: "With friends" },
];

export default function CreateItineraryPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    adults: 2,
    children: 0,
    budgetLevel: "moderate" as "budget" | "moderate" | "luxury",
    interests: [] as string[],
    travelStyle: [] as string[],
    pace: "moderate" as "relaxed" | "moderate" | "packed",
    specialRequests: "",
  });

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const toggleStyle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(id)
        ? prev.travelStyle.filter((s) => s !== id)
        : [...prev.travelStyle, id],
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          travelers: {
            adults: formData.adults,
            children: formData.children,
          },
          budget: {
            level: formData.budgetLevel,
          },
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          pace: formData.pace,
          specialRequests: formData.specialRequests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        alert(`Error: ${errorData.error || "Failed to generate itinerary"}`);
        setGenerating(false);
        return;
      }

      const data = await response.json();
      console.log("API response:", data);
      console.log("data.success:", data.success);
      console.log("data.itinerary:", data.itinerary);
      console.log("data.itinerary?.id:", data.itinerary?.id);

      if (data.success && data.itinerary) {
        console.log("SUCCESS: Storing itinerary and navigating...");
        // Store itinerary in sessionStorage
        sessionStorage.setItem(
          "generated_itinerary",
          JSON.stringify(data.itinerary),
        );
        console.log(
          "Stored in sessionStorage, now navigating to:",
          `/itinerary/${data.itinerary.id}`,
        );
        // Navigate to view page
        router.push(`/itinerary/${data.itinerary.id}`);
      } else {
        console.error("Generation failed:", data);
        alert(data.error || "Failed to generate itinerary. Please try again.");
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert(
        "An error occurred while generating your itinerary. Please check the console (F12) for details and try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.destination && formData.startDate && formData.endDate;
      case 2:
        return formData.adults > 0;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return formData.travelStyle.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-slate-600 dark:text-slate-300 hover:text-brand-orange transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              <span className="font-bold text-slate-900 dark:text-white">
                AI Trip Planner
              </span>
            </div>
            <div className="text-sm text-slate-500">Step {step}/5</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-orange to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step 1: Destination & Dates */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Where to? ✈️
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Tell us your destination and travel dates
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                      placeholder="e.g., Paris, France or Tokyo, Japan"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Travelers & Budget */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Who&apos;s traveling? 👥
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Number of travelers and budget level
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    Number of Travelers
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block">
                        Adults
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              adults: Math.max(1, formData.adults - 1),
                            })
                          }
                          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-brand-orange hover:text-white transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white w-12 text-center">
                          {formData.adults}
                        </span>
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              adults: formData.adults + 1,
                            })
                          }
                          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-brand-orange hover:text-white transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block">
                        Children
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              children: Math.max(0, formData.children - 1),
                            })
                          }
                          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-brand-orange hover:text-white transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white w-12 text-center">
                          {formData.children}
                        </span>
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              children: formData.children + 1,
                            })
                          }
                          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-brand-orange hover:text-white transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    Budget Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {["budget", "moderate", "luxury"].map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            budgetLevel: level as any,
                          })
                        }
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          formData.budgetLevel === level
                            ? "border-brand-orange bg-orange-50 dark:bg-orange-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {level === "budget"
                            ? "💰"
                            : level === "moderate"
                              ? "💳"
                              : "✨"}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">
                          {level}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    Trip Pace
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {["relaxed", "moderate", "packed"].map((pace) => (
                      <button
                        key={pace}
                        onClick={() =>
                          setFormData({ ...formData, pace: pace as any })
                        }
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          formData.pace === pace
                            ? "border-brand-orange bg-orange-50 dark:bg-orange-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {pace === "relaxed"
                            ? "🧘"
                            : pace === "moderate"
                              ? "🚶"
                              : "🏃"}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">
                          {pace}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {pace === "relaxed"
                            ? "4 activities/day"
                            : pace === "moderate"
                              ? "5 activities/day"
                              : "6+ activities/day"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                What interests you? 🎯
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Select all that apply (minimum 1)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    formData.interests.includes(interest.id)
                      ? "border-brand-orange bg-orange-50 dark:bg-orange-900/20 scale-105"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {interest.label}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Travel Style */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Your travel style? 🎒
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Select your preferred travel style
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    formData.travelStyle.includes(style.id)
                      ? "border-brand-orange bg-orange-50 dark:bg-orange-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {style.label}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Special Requests & Generate */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Any special requests? 📝
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Optional: Add any specific requirements or preferences
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="e.g., Vegetarian meals, accessible locations, avoid outdoor activities, include specific attractions..."
                rows={6}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-orange-200 dark:border-orange-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                Trip Summary
              </h3>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p>
                  📍 <strong>Destination:</strong> {formData.destination}
                </p>
                <p>
                  📅 <strong>Dates:</strong> {formData.startDate} to{" "}
                  {formData.endDate}
                </p>
                <p>
                  👥 <strong>Travelers:</strong> {formData.adults} adult(s)
                  {formData.children > 0 && `, ${formData.children} child(ren)`}
                </p>
                <p>
                  💰 <strong>Budget:</strong> {formData.budgetLevel}
                </p>
                <p>
                  🎯 <strong>Interests:</strong> {formData.interests.join(", ")}
                </p>
                <p>
                  🎒 <strong>Style:</strong> {formData.travelStyle.join(", ")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-8 py-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`px-8 py-4 rounded-full font-bold transition-all shadow-lg ${
                canProceed()
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-2xl hover:scale-105 hover:from-orange-600 hover:to-orange-700"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`px-12 py-4 rounded-full font-bold transition-all flex items-center gap-3 shadow-xl ${
                generating
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 hover:from-orange-600 hover:via-purple-600 hover:to-purple-700"
              }`}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Itinerary
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
