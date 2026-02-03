"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Users, Ticket, MapPin, Clock } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface Props {
  initialData: {
    activityId: string;
    date: string;
    tickets: { [key: string]: number };
    ticketTypes: Array<{ name: string; price: number }>;
    voucherCode?: string;
    discountAmount?: number;
  };
  onSubmit: (data: any) => void;
}

interface ActivityDetails {
  activityTitle: string;
  activityImage: string;
  location: string;
  price: number;
  currency: string;
}

export const ActivityCheckoutForm = ({ initialData, onSubmit }: Props) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<ActivityDetails | null>(null);

  // Contact Info (Editable, Pre-filled from Clerk)
  const [contact, setContact] = useState({
    name: user?.fullName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.primaryPhoneNumber?.phoneNumber || "",
  });

  // Special Requests
  const [specialRequests, setSpecialRequests] = useState("");

  // Fetch Activity Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: activity } = await supabase
          .from("activities")
          .select("title, image_url, location, price, currency")
          .eq("id", initialData.activityId)
          .single();

        if (activity) {
          setDetails({
            activityTitle: activity.title,
            activityImage: activity.image_url || "/images/placeholder-activity.jpg",
            location: activity.location || "Vietnam",
            price: activity.price,
            currency: activity.currency || "USD",
          });
        }
      } catch (err) {
        console.error("Failed to fetch activity details", err);
        toast.error("Failed to load activity details");
      }
    };

    if (initialData.activityId) {
      fetchDetails();
    }
  }, [initialData.activityId, supabase]);

  // Update contact when user loads
  useEffect(() => {
    if (user) {
      setContact({
        name: user.fullName || "",
        email: user.emailAddresses?.[0]?.emailAddress || "",
        phone: user.primaryPhoneNumber?.phoneNumber || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    if (!contact.name || !contact.email || !contact.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate Phone (VN format)
    const phoneRegex = /^(0|\+84)(3|5|7|8|9|2)\d{8}$/;
    if (!phoneRegex.test(contact.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number (e.g., 0912345678)");
      return;
    }

    setIsLoading(true);

    // Build payload for checkout service
    const payload = {
      activityId: initialData.activityId,
      date: initialData.date,
      tickets: initialData.tickets,
      guestDetails: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || undefined,
      },
      specialRequests: specialRequests || undefined,
      voucherCode: initialData.voucherCode,
      discountAmount: initialData.discountAmount,
    };

    console.log("[ActivityCheckoutForm] Submitting Payload:", payload);

    onSubmit(payload);
  };

  // Calculate totals
  const totalTickets = Object.values(initialData.tickets).reduce((sum, count) => sum + count, 0);
  const subtotal = initialData.ticketTypes.reduce((sum, ticket) => {
    const count = initialData.tickets[ticket.name] || 0;
    return sum + ticket.price * count;
  }, 0);
  const discount = initialData.discountAmount || 0;
  const totalPrice = Math.max(0, subtotal - discount);
  const currency = details?.currency || "USD";

  if (!details) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-200 dark:bg-slate-800 h-64 rounded-2xl" />
        <div className="bg-slate-200 dark:bg-slate-800 h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* 1. Activity Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative h-48 w-full">
          <Image
            src={details.activityImage}
            alt={details.activityTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-white text-2xl font-bold">
              {details.activityTitle}
            </h2>
            <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {details.location}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
          {/* Date Info */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Date
              </span>
              <div className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5E1F]" />
                {new Date(initialData.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/50">
            <div className="space-y-2 mb-2">
              {initialData.ticketTypes.map((ticket, i) => {
                const count = initialData.tickets[ticket.name] || 0;
                if (count === 0) return null;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#FF5E1F]" />
                      <span className="font-medium">
                        {count}x {ticket.name}
                      </span>
                    </div>
                    <span className="font-semibold">
                      ${(ticket.price * count).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Breakdown */}
            <div className="space-y-1 pt-2 mt-2 border-t border-orange-200 dark:border-orange-800/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Subtotal
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>
                    Voucher Discount{" "}
                    {initialData.voucherCode
                      ? `(${initialData.voucherCode})`
                      : ""}
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-[#FF5E1F] pt-2 border-t border-orange-200 dark:border-orange-800/50 mt-2">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ticket Count */}
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {totalTickets} Ticket{totalTickets !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <p className="text-sm text-slate-500">
          Booking confirmation will be sent to this email address
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="+84 912 345 678"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              placeholder="john@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* 3. Special Requests (Optional) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xl font-semibold">Special Requests</h2>
        <p className="text-sm text-slate-500">
          Optional: Let us know if you have any special requirements
        </p>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="e.g., Accessibility requirements, dietary restrictions..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E1F] focus:border-transparent resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-bold bg-[#FF5E1F] hover:bg-orange-600 shadow-lg shadow-orange-500/20"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>

      {/* Notice */}
      <p className="text-xs text-center text-slate-500">
        By proceeding, you agree to our Terms & Conditions and Privacy Policy.
        Bookings are non-refundable unless otherwise stated.
      </p>
    </form>
  );
};
