"use client";

import React, { useState, useEffect } from "react";
import { useHotelPartnerStore } from "@/store/useHotelPartnerStore";
import { useUser } from "@clerk/nextjs";
import { HotelPortalLayout } from "./HotelPortalLayout";
import { HotelDashboard } from "./HotelDashboard";
import { HotelOnboardingForm } from "./onboarding/HotelOnboardingForm";

// Properties
import { HotelList } from "./properties/HotelList";
import { HotelDetails } from "./properties/HotelDetails";

// Rooms
import { RoomTypes } from "./rooms/RoomTypes";
import { RoomInventory } from "./rooms/RoomInventory";

// Rates
import { RateCalendar } from "./rates/RateCalendar";
import { RateManagement } from "./rates/RateManagement";
import { BulkUpdate } from "./rates/BulkUpdate";

// Bookings
import { BookingList } from "./bookings/BookingList";
import { BookingCalendar } from "./bookings/BookingCalendar";
import { CheckInOut } from "./bookings/CheckInOut";

// Analytics
import { DashboardMetrics } from "./analytics/DashboardMetrics";
import { RevenueReport } from "./analytics/RevenueReport";
import { OccupancyReport } from "./analytics/OccupancyReport";
import { FinancialReports } from "./analytics/FinancialReports";

// Reviews
import { ReviewsList } from "./reviews/ReviewsList";
import { RespondReviews } from "./reviews/RespondReviews";

// Settings
import { AccountSettings } from "./settings/AccountSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { PayoutSettings } from "./settings/PayoutSettings";

type Section =
  | "dashboard"
  | "hotel-list"
  | "hotel-details"
  | "room-types"
  | "room-inventory"
  | "rate-calendar"
  | "rate-management"
  | "bulk-update"
  | "booking-list"
  | "booking-calendar"
  | "check-in-out"
  | "dashboard-metrics"
  | "revenue-report"
  | "occupancy-report"
  | "financial-reports"
  | "reviews-list"
  | "respond-reviews"
  | "account-settings"
  | "notification-settings"
  | "payout-settings";

export function HotelPortal() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const { user } = useUser();
  const { partner, isLoading, fetchPartner } = useHotelPartnerStore();
  const pid = partner?.id ?? "";
  const [registered, setRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    // Check hotel registration via x-user-id header
    fetch("/api/partner/hotel/me", { headers: { "x-user-id": user.id } })
      .then(r => r.json())
      .then(data => {
        if (data.success) setRegistered(true);
        else setRegistered(false);
      })
      .catch(() => setRegistered(false));
  }, [user]);

  // Show loading state while checking
  if (registered === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Not registered - show onboarding form
  if (!registered) {
    return <HotelOnboardingForm />;
  }

  const renderContent = () => {
    switch (activeSection) {
      // Dashboard
      case "dashboard":
        return <HotelDashboard partnerId={pid} />;

      // Properties
      case "hotel-list":
        return <HotelList partnerId={pid} />;
      case "hotel-details":
        return <HotelDetails />;

      // Rooms
      case "room-types":
        return <RoomTypes partnerId={pid} />;
      case "room-inventory":
        return <RoomInventory partnerId={pid} />;

      // Rates
      case "rate-calendar":
        return <RateCalendar partnerId={pid} />;
      case "rate-management":
        return <RateManagement partnerId={pid} />;
      case "bulk-update":
        return <BulkUpdate partnerId={pid} />;

      // Bookings
      case "booking-list":
        return <BookingList partnerId={pid} />;
      case "booking-calendar":
        return <BookingCalendar partnerId={pid} />;
      case "check-in-out":
        return <CheckInOut partnerId={pid} />;

      // Analytics
      case "dashboard-metrics":
        return <DashboardMetrics partnerId={pid} />;
      case "revenue-report":
        return <RevenueReport partnerId={pid} />;
      case "occupancy-report":
        return <OccupancyReport partnerId={pid} />;
      case "financial-reports":
        return <FinancialReports partnerId={pid} />;

      // Reviews
      case "reviews-list":
        return <ReviewsList partnerId={pid} />;
      case "respond-reviews":
        return <RespondReviews partnerId={pid} />;

      // Settings
      case "account-settings":
        return <AccountSettings />;
      case "notification-settings":
        return <NotificationSettings />;
      case "payout-settings":
        return <PayoutSettings />;

      default:
        return <HotelDashboard partnerId={pid} />;
    }
  };

  return (
    <HotelPortalLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </HotelPortalLayout>
  );
}
