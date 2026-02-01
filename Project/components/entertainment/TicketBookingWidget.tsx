"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Ticket,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { EntertainmentItemDetail } from "@/lib/hooks/useEntertainmentAPI";

interface TicketBookingWidgetProps {
  item: EntertainmentItemDetail;
}

export function TicketBookingWidget({ item }: TicketBookingWidgetProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>(
    item.ticket_types?.[0]?.id || "",
  );
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const selectedTicketType = item.ticket_types?.find(
    (t) => t.id === selectedTicketTypeId,
  );

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  // Calculate total price
  const ticketPrice =
    (selectedTicketType?.price?.amount ||
      selectedTicketType?.price ||
      item.min_price ||
      0) * ticketQuantity;
  const addOnsPrice = selectedAddOns.reduce((sum, addonId) => {
    const addon = item.addOns?.find((a) => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const subtotal = ticketPrice + addOnsPrice;
  const fees = Math.round(subtotal * 0.075); // 7.5% booking fee
  const total = subtotal + fees;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = ticketQuantity + delta;
    const maxAllowed = selectedTicketType?.max_per_booking || 10;
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setTicketQuantity(newQuantity);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // Get customer information from Clerk user profile
      let customerName: string;
      let customerEmail: string;

      if (user && isLoaded) {
        // Use authenticated user's profile information
        customerName =
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Guest User";
        customerEmail = user.primaryEmailAddress?.emailAddress || "";

        if (!customerEmail) {
          alert(
            "Your profile is missing an email address. Please update your profile.",
          );
          setIsBooking(false);
          return;
        }
      } else {
        // Guest booking - prompt for information
        const name = prompt("Please enter your full name:");
        if (!name) {
          setIsBooking(false);
          return;
        }
        customerName = name;

        const email = prompt("Please enter your email address:");
        if (!email || !email.includes("@")) {
          alert("Please provide a valid email address");
          setIsBooking(false);
          return;
        }
        customerEmail = email;
      }

      // Call real booking API
      const response = await fetch("/api/entertainment/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: item.id,
          session_id: item.sessions?.[0]?.id || null,
          ticket_type_id: selectedTicketTypeId,
          quantity: ticketQuantity,
          customer: {
            name: customerName,
            email: customerEmail,
          },
          add_ons: selectedAddOns,
          special_requests: "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Booking failed");
      }

      // Success! Show confirmation modal
      setConfirmationCode(result.data.confirmation_code);
      setShowSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        `❌ Booking failed: ${error instanceof Error ? error.message : "Please try again."}`,
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <aside
      className="hidden lg:block w-full sticky top-24 z-30"
      data-booking-widget
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-50 p-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="text-center space-y-4 max-w-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </motion.div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h3>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Confirmation Code
                  </p>
                  <p className="text-3xl font-black text-orange-600 tracking-wider">
                    {confirmationCode}
                  </p>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  A confirmation email has been sent to{" "}
                  <span className="font-semibold">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>{" "}
                  with your tickets and QR codes.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/my-bookings")}
                    className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Header */}
        <div className="flex items-end gap-2 mb-6">
          <span className="text-4xl font-black text-slate-900 dark:text-white">
            ${item.min_price}
          </span>
          <span className="text-lg text-slate-500 font-medium mb-1">
            / ticket
          </span>
          {item.ticket_types && item.ticket_types.length > 1 && (
            <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              From
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-orange-500 transition-colors group text-left">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Event Date
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {item.sessions?.[0]?.session_date
                  ? new Date(item.sessions[0].session_date).toLocaleDateString()
                  : "Date TBA"}
              </p>
              {item.sessions?.[0]?.start_time && (
                <p className="text-sm text-slate-500 mt-1">
                  {item.sessions[0].start_time}
                </p>
              )}
            </div>
            <Calendar
              className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Ticket Type Selection */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Ticket Type
          </p>
          <div className="space-y-2">
            {item.ticket_types?.map((ticketType) => (
              <button
                key={ticketType.id}
                onClick={() => setSelectedTicketTypeId(ticketType.id)}
                className={`w-full p-4 rounded-[1.5rem] border text-left transition-all ${
                  selectedTicketType?.id === ticketType.id
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      {ticketType.name}
                    </p>
                    {ticketType.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ticketType.description}
                      </p>
                    )}
                    {ticketType.available_stock !== undefined && (
                      <p className="text-xs text-slate-400 mt-2">
                        {ticketType.available_stock} remaining
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-600 dark:text-orange-400">
                      $
                      {typeof ticketType.price === "object"
                        ? ticketType.price.amount
                        : ticketType.price}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quantity
          </p>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={ticketQuantity <= 1}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 transition-colors"
            >
              <Minus className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {ticketQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={ticketQuantity >= 10}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Add-ons */}
        {item.addOns && item.addOns.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Enhance Your Experience
            </p>
            <div className="space-y-2">
              {item.addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                    selectedAddOns.includes(addon.id)
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addon.id)}
                    onChange={() => toggleAddOn(addon.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {addon.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {addon.description}
                    </p>
                  </div>
                  <p className="font-black text-sm text-orange-600 dark:text-orange-400">
                    +${addon.price}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="mb-6 space-y-2 py-4 border-t border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {ticketQuantity}x {selectedTicketType?.name || "Ticket"}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${ticketPrice}
            </span>
          </div>
          {addOnsPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Add-ons
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                ${addOnsPrice}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Service fees
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${fees}
            </span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-black text-slate-900 dark:text-white">
              Total
            </span>
            <span className="font-black text-orange-600 dark:text-orange-400">
              ${total}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={isBooking}
          className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? "Processing..." : "Book Now"}
        </button>

        {/* Trust Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Instant confirmation
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Secure payment processing
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Mobile tickets accepted
          </div>
        </div>
      </div>
    </aside>
  );
}

interface MobileBookingBarProps {
  item: EntertainmentItemDetail;
}

export function MobileBookingBar({ item }: MobileBookingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 lg:hidden flex items-center justify-between gap-4 pb-8 shadow-2xl">
      <div>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ${item.min_price}
          </span>
          <span className="text-sm text-slate-500 mb-1">/ ticket</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
          <Ticket className="w-3 h-3" strokeWidth={1.5} />
          {item.sessions?.[0]?.session_date
            ? new Date(item.sessions[0].session_date).toLocaleDateString()
            : "Date TBA"}
        </p>
      </div>
      <button className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20">
        Book Now
      </button>
    </div>
  );
}
