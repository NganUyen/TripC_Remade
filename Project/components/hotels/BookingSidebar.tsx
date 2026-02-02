"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  ChevronDown,
  Check,
  Loader2,
  CheckCircle,
  X,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  hotel: any;
  className?: string;
  onClose?: () => void; // For mobile close
  isMobile?: boolean;
}

function BookingForm({ hotel, className, onClose, isMobile = false }: BookingFormProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Calculate price from best_price (in cents) or use fallback
  const price = hotel?.best_price ? Math.floor(hotel.best_price / 100) : 840;
  const roomTypes = hotel?.rooms || [];

  // Booking state
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    roomTypes[0]?.id || "",
  );
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean>(false);

  // Get tomorrow as minimum check-in date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minCheckIn = tomorrow.toISOString().split("T")[0];

  // Calculate nights and total
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const roomTotal = price * nights;
  const tax = Math.round(roomTotal * 0.1 * 100) / 100;
  const serviceFee = Math.round(roomTotal * 0.05 * 100) / 100;
  const grandTotal = roomTotal + tax + serviceFee;

  // Handle booking submission
  const handleReserve = async () => {
    setError("");

    // Validation
    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (nights < 1) {
      setError("Check-out must be at least 1 day after check-in");
      return;
    }

    if (!selectedRoomId) {
      setError("Please select a room type");
      return;
    }

    if (adults < 1 || adults > 10) {
      setError("Number of adults must be between 1 and 10");
      return;
    }

    // Redirect to Unified Checkout
    // Pass IDs and Intent as Query Params
    const query = new URLSearchParams({
      hotelId: hotel.id,
      roomId: selectedRoomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: adults.toString(),
      children: children.toString()
    });

    router.push(`/hotel/checkout?${query.toString()}`);
  };

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative", className)}>
      {/* Mobile Close Handle */}
      {isMobile && (
        <div className="flex justify-center mb-4 lg:hidden" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer" />
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-50 p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Booking Confirmed!
            </h3>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Confirmation Code
              </p>
              <p className="text-3xl font-black text-orange-600 tracking-wider">
                {confirmationCode}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Check your email for booking details
            </p>
            <button
              onClick={() => router.push("/my-bookings")}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      {/* Price Header */}
      <div className="flex items-end gap-2 mb-6">
        <span className="text-4xl font-black text-slate-900 dark:text-white">
          ${price}
        </span>
        <span className="text-lg text-slate-500 font-medium mb-1">
          / night
        </span>
        {hotel?.best_price && (
          <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
            Best Price
          </div>
        )}
      </div>

      {/* Inputs Boarding Pass Style */}
      <div className="space-y-3 mb-6">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 p-1 rounded-[1.5rem]">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-l-[1.2rem] rounded-r-lg text-left">
            <label
              htmlFor={`checkin-${isMobile ? 'mobile' : 'desktop'}`}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
            >
              Check-in
            </label>
            <input
              type="date"
              id={`checkin-${isMobile ? 'mobile' : 'desktop'}`}
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={minCheckIn}
              className="font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full cursor-pointer hover:text-orange-500"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-r-[1.2rem] rounded-l-lg text-left">
            <label
              htmlFor={`checkout-${isMobile ? 'mobile' : 'desktop'}`}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
            >
              Check-out
            </label>
            <input
              type="date"
              id={`checkout-${isMobile ? 'mobile' : 'desktop'}`}
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || minCheckIn}
              className="font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full cursor-pointer hover:text-orange-500"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="relative">
          <button
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-orange-500 transition-colors group text-left"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Guests
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {adults} Adult{adults !== 1 ? "s" : ""}
                {children > 0
                  ? `, ${children} Child${children !== 1 ? "ren" : ""}`
                  : ""}
                , 1 Room
              </p>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-all ${showGuestDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showGuestDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Adults
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 dark:text-white w-6 text-center">
                    {adults}
                  </span>
                  <button
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Children
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 dark:text-white w-6 text-center">
                    {children}
                  </span>
                  <button
                    onClick={() => setChildren(Math.min(5, children + 1))}
                    className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Selection */}
      {roomTypes.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Room Type
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {roomTypes.slice(0, 3).map((room: any) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold truncate transition-all ${selectedRoomId === room.id
                  ? "border border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-500"
                  }`}
              >
                {room.room_type || "Standard"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="mb-4 space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              ${price} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${roomTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Tax (10%)
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Service Fee (5%)
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${serviceFee.toFixed(2)}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              Total
            </span>
            <span className="font-black text-xl text-orange-600">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Action */}
      <button
        onClick={handleReserve}
        disabled={isBooking || !checkInDate || !checkOutDate || nights < 1}
        className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isBooking ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Reserve Sanctuary"
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
        <Check className="w-3 h-3 text-green-500" /> Free cancellation before
        check-in
      </div>
    </div>
  );
}

export function BookingSidebar({ hotel }: { hotel: any }) {
  return (
    <aside className="hidden lg:block w-full sticky top-24 z-30">
      <BookingForm hotel={hotel} />
    </aside>
  )
}

export function MobileBookingBar({ hotel }: { hotel: any }) {
  const price = hotel?.best_price ? Math.floor(hotel.best_price / 100) : 840;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 lg:hidden flex items-center justify-between gap-4 pb-8 safe-area-pb transition-transform duration-300">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ${price}
            </span>
            <span className="text-sm text-slate-500 mb-1">/ night</span>
          </div>
          <p className="text-xs text-green-600 font-bold">Best Available Rate</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          Reserve
        </button>
      </div>

      {/* Mobile Booking Drawer (Bottom Sheet) */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sheet Content - Remounting/Hiding Strategy: We use translation to keep state */}
      <div
        className={cn(
          "fixed bottom-0 left-0 w-full z-[51] lg:hidden transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
          isOpen ? "translate-y-0" : "translate-y-[110%]"
        )}
      >
        <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 pb-8 no-scrollbar">
            <BookingForm
              hotel={hotel}
              isMobile
              onClose={() => setIsOpen(false)}
              className="shadow-none border-none p-0"
            />
          </div>
        </div>
      </div>
    </>
  );
}
