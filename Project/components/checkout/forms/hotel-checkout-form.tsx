"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Users, BedDouble, MapPin } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface Props {
  initialData: {
    hotelId: string;
    roomId: string;
    dates: { start: string; end: string };
    guests: { adults: number; children: number };
    rate: number;
  };
  onSubmit: (data: any) => void;
}

export const HotelCheckoutForm = ({ initialData, onSubmit }: Props) => {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<{
    hotelName: string;
    hotelImage: string;
    roomName: string;
    address: string;
  } | null>(null);

  // Read-Only Data from Intent
  const { dates, guests } = initialData;

  // Contact Info (Editable, Pre-filled)
  const [contact, setContact] = useState({
    name: user?.fullName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.primaryPhoneNumber?.phoneNumber || "",
  });

  // Fetch Hotel & Room Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch Hotel
        const { data: hotel } = await supabase
          .from("hotels")
          .select("name, address, images")
          .eq("id", initialData.hotelId)
          .single();

        // Fetch Room
        const { data: room } = await supabase
          .from("rooms")
          .select("name")
          .eq("id", initialData.roomId)
          .single();

        if (hotel) {
          let addressStr = "Vietnam";
          if (hotel.address) {
            if (typeof hotel.address === "object") {
              // Extract readable parts from JSON address
              // @ts-ignore
              const { line1, city, country } = hotel.address;
              addressStr =
                [line1, city, country].filter(Boolean).join(", ") || "Vietnam";
            } else {
              addressStr = String(hotel.address);
            }
          }

          setDetails({
            hotelName: hotel.name,
            address: addressStr,
            hotelImage: hotel.images?.[0] || "/images/placeholder-hotel.jpg",
            roomName: room?.name || "Selected Room",
          });
        }
      } catch (err) {
        console.error("Failed to fetch hotel details", err);
      }
    };

    if (initialData.hotelId && initialData.roomId) {
      fetchDetails();
    }
  }, [initialData.hotelId, initialData.roomId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);

    // Submitting INTENT to Container. Server calculates absolute price.
    const payload = {
      hotelId: initialData.hotelId,
      roomId: initialData.roomId,
      dates: dates,
      guestDetails: contact,
      guestCount: guests,
      rate: initialData.rate, // Pass explicitly so Server can rely on it if DB fetch skipped (MVP)
    };

    console.log("[HotelCheckoutForm] Submitting Payload:", payload);

    onSubmit(payload);
  };

  // Calculate Nights
  const start = new Date(dates.start);
  const end = new Date(dates.end);
  const nights = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

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
      {/* 1. Hotel Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative h-48 w-full">
          <Image
            src={details.hotelImage}
            alt={details.hotelName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-white text-2xl font-bold">
              {details.hotelName}
            </h2>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              {details.address}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3 mb-2">
            <BedDouble className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {details.roomName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Check-in
              </span>
              <div className="font-semibold">{dates.start || "N/A"}</div>
            </div>
            <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Check-out
              </span>
              <div className="font-semibold">{dates.end || "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {nights} Night{nights !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {guests.adults} Adult{guests.adults !== 1 ? "s" : ""},{" "}
                {guests.children} Child{guests.children !== 1 ? "ren" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Information (Confirm/Edit) */}
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

      <Button
        type="submit"
        className="w-full h-12 text-lg font-bold bg-[#FF5E1F] hover:bg-orange-600 shadow-lg shadow-orange-500/20"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </form>
  );
};
