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

  // Voucher State
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Handle Voucher Application
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setIsValidatingVoucher(true);
    setVoucherMessage("");
    setDiscountAmount(0);
    setIsVoucherApplied(false);

    try {
      const res = await fetch("/api/v1/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode,
          cartTotal:
            ((typeof selectedTicketType?.price === 'object' ? (selectedTicketType.price as any).amount : selectedTicketType?.price) ||
              item.min_price ||
              0) * ticketQuantity +
            Math.round(
              (((typeof selectedTicketType?.price === 'object' ? (selectedTicketType.price as any).amount : selectedTicketType?.price) ||
                item.min_price ||
                0) *
                ticketQuantity +
                selectedAddOns.reduce((sum, addonId) => {
                  const addon = item.addOns?.find((a: any) => a.id === addonId);
                  return sum + (addon?.price || 0);
                }, 0)) *
              0.075
            ),
          serviceType: "entertainment", // Use 'entertainment' to match validation logic mapping
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVoucherMessage(data.error || "Invalid voucher");
        return;
      }

      if (data.valid) {
        setDiscountAmount(data.discountAmount);
        setIsVoucherApplied(true);
        setVoucherMessage(`Voucher applied: -$${data.discountAmount}`);
      }
    } catch (err) {
      setVoucherMessage("Failed to validate voucher");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Calculate total price
  const ticketPrice =
    ((typeof selectedTicketType?.price === 'object' ? (selectedTicketType.price as any).amount : selectedTicketType?.price) ||
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
    // Check authentication first
    if (!isLoaded) return;

    if (!user) {
      // Redirect to sign-in with return URL
      router.push(`/sign-in?redirect_url=/entertainment/${item.id}`);
      return;
    }

    // Validate selection
    if (!selectedTicketTypeId) {
      alert("Please select a ticket type");
      return;
    }

    setIsBooking(true);
    try {
      // Build checkout URL with query params (unified payment pattern - same as Events)
      const sessionId = item.sessions?.[0]?.id || "";

      const query = new URLSearchParams({
        itemId: item.id,
        sessionId: sessionId,
        ticketTypeId: selectedTicketTypeId,
        quantity: ticketQuantity.toString(),
        voucherCode: isVoucherApplied ? voucherCode : "",
        discountAmount: discountAmount.toString(),
      });

      // Navigate to checkout page
      router.push(`/entertainment/checkout?${query.toString()}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsBooking(false);
    }
  };

  return (
    <aside
      className="hidden lg:block w-full sticky top-24 z-30"
      data-booking-widget
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">

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
                className={`w-full p-4 rounded-[1.5rem] border text-left transition-all ${selectedTicketType?.id === ticketType.id
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
                  className={`flex items-start gap-3 p-4 rounded-[1.5rem] border cursor-pointer transition-all ${selectedAddOns.includes(addon.id)
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

          {/* Voucher Input */}
          <div className="pt-2 pb-2">
            <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
              <input
                type="text"
                placeholder="Promo code"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase())
                  setIsVoucherApplied(false)
                  setDiscountAmount(0)
                  setVoucherMessage('')
                }}
                className="flex-1 px-4 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={!voucherCode || isValidatingVoucher}
                className="px-6 py-2 bg-[#0B1525] text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50 disabled:shadow-none"
              >
                {isValidatingVoucher ? '...' : 'Apply'}
              </button>
            </div>
            {voucherMessage && (
              <p className={`text-xs mt-2 ml-4 font-medium ${isVoucherApplied ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {voucherMessage}
              </p>
            )}
          </div>

          {isVoucherApplied && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-top-1">
              <span>Discount</span>
              <span>-${discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-black text-slate-900 dark:text-white">
              Total
            </span>
            <span className="font-black text-orange-600 dark:text-orange-400">
              ${Math.max(0, total - discountAmount)}
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
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleMobileBook = () => {
    if (!isLoaded) return;

    if (!user) {
      router.push(`/sign-in?redirect_url=/entertainment/${item.id}`);
      return;
    }

    // Navigate to checkout with first ticket type selected
    const ticketTypeId = item.ticket_types?.[0]?.id || "";
    const sessionId = item.sessions?.[0]?.id || "";

    const query = new URLSearchParams({
      itemId: item.id,
      sessionId: sessionId,
      ticketTypeId: ticketTypeId,
      quantity: "1",
    });

    router.push(`/entertainment/checkout?${query.toString()}`);
  };
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
      <button
        onClick={handleMobileBook}
        className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20"
      >
        Book Now
      </button>
    </div>
  );
}
