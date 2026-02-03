"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface Props {
  initialData: {
    serviceId: string;
    venueId: string;
    appointmentDate: string;
    appointmentTime: string;
    voucherCode?: string;
    discountAmount?: number;
  };
  onSubmit: (data: any) => void;
}

interface BeautyDetails {
  serviceName: string;
  serviceImage: string;
  venueAddress: string;
  price: number;
  duration: number;
  currency: string;
}

export const BeautyCheckoutForm = ({ initialData, onSubmit }: Props) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<BeautyDetails | null>(null);

  // Contact Info (Editable, Pre-filled)
  const [contact, setContact] = useState({
    name: user?.fullName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.primaryPhoneNumber?.phoneNumber || "",
  });

  // Fetch Beauty Service & Venue Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch Service
        const { data: service } = await supabase
          .from("beauty_services")
          .select("name, description, price, duration_minutes, image_url, currency")
          .eq("id", initialData.serviceId)
          .single();

        // Fetch Venue
        const { data: venue } = await supabase
          .from("beauty_venues")
          .select("name, address, location_summary")
          .eq("id", initialData.venueId)
          .single();

        if (service && venue) {
          let addressStr = "Vietnam";
          if (venue.address) {
            addressStr = typeof venue.address === "string" ? venue.address : venue.location_summary || "Vietnam";
          }

          setDetails({
            serviceName: service.name,
            serviceImage: service.image_url || "/images/placeholder-beauty.jpg",
            venueAddress: addressStr,
            price: service.price,
            duration: service.duration_minutes,
            currency: service.currency || "USD",
          });
        }
      } catch (err) {
        console.error("Failed to fetch beauty details", err);
      }
    };

    if (initialData.serviceId && initialData.venueId) {
      fetchDetails();
    }
  }, [initialData.serviceId, initialData.venueId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);

    // Build payload for checkout service
    const payload = {
      serviceId: initialData.serviceId,
      venueId: initialData.venueId,
      appointmentDate: initialData.appointmentDate,
      appointmentTime: initialData.appointmentTime,
      guestDetails: contact,
      voucherCode: initialData.voucherCode,
      discountAmount: initialData.discountAmount,
    };

    console.log("[BeautyCheckoutForm] Submitting Payload:", payload);

    onSubmit(payload);
  };

  // Calculate totals
  const price = details?.price || 0;
  const discount = initialData.discountAmount || 0;
  const totalPrice = Math.max(0, price - discount);
  const currency = details?.currency || "USD";

  if (!details) {
    return (
      <div className="p-8 text-center text-slate-500">Loading details...</div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* 1. Service Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative h-48 w-full">
          <Image
            src={details.serviceImage}
            alt={details.serviceName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-white text-2xl font-bold">
              {details.serviceName}
            </h2>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              {details.venueAddress}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Beauty Treatment
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Date
              </span>
              <div className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5E1F]" />
                {new Date(initialData.appointmentDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Time
              </span>
              <div className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF5E1F]" />
                {initialData.appointmentTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{details.duration} minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Guest Information (Confirm/Edit) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xl font-semibold">Guest Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="+1 234 567 8900"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      {/* 3. Price Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Price Detail</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Service Price
            </span>
            <span>
              {currency === "USD" ? "$" : ""}
              {price.toFixed(2)}
            </span>
          </div>

          {/* Voucher Discount Display */}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Voucher Discount</span>
              <span>
                -{currency === "USD" ? "$" : ""}
                {discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-end">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-black text-[#FF5E1F]">
                {currency === "USD" ? "$" : ""}
                {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg font-bold bg-[#FF5E1F] hover:bg-orange-600 shadow-lg shadow-orange-500/20 rounded-xl"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </form>
  );
};
