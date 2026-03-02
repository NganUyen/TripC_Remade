"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useFlightPartnerStore } from "@/store/useFlightPartnerStore";
import FlightPortalLayout from "./FlightPortalLayout";
import FlightDashboard from "./FlightDashboard";
import { FlightRegistration } from "./FlightRegistration";

// Flights
import FlightList from "./flights/FlightList";
import FlightSchedule from "./flights/FlightSchedule";

// Routes
import RouteList from "./routes/RouteList";
import RouteAnalytics from "./routes/RouteAnalytics";

// Pricing
import PricingRules from "./pricing/PricingRules";
import DynamicPricing from "./pricing/DynamicPricing";

// Bookings
import BookingList from "./bookings/BookingList";
import PassengerManagement from "./bookings/PassengerManagement";
import CheckInManagement from "./bookings/CheckInManagement";

// Analytics
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
import RevenueReport from "./analytics/RevenueReport";
import CapacityReport from "./analytics/CapacityReport";
import PerformanceMetrics from "./analytics/PerformanceMetrics";

// Settings
import AccountSettings from "./settings/AccountSettings";
import NotificationSettings from "./settings/NotificationSettings";
import PayoutSettings from "./settings/PayoutSettings";

type Section =
  | "dashboard"
  | "flight-list"
  | "flight-schedule"
  | "route-list"
  | "route-analytics"
  | "pricing-rules"
  | "dynamic-pricing"
  | "booking-list"
  | "passenger-management"
  | "check-in-management"
  | "analytics-dashboard"
  | "revenue-report"
  | "capacity-report"
  | "performance-metrics"
  | "account-settings"
  | "notification-settings"
  | "payout-settings";

export function FlightPortal() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const { user } = useUser();
  const { partner } = useFlightPartnerStore();
  const pid = partner?.airline_code ?? "";
  const [registered, setRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/partner/flight/register', { headers: { 'x-user-id': user.id } })
      .then(r => r.json())
      .then(data => setRegistered(data.success === true))
      .catch(() => setRegistered(false));
  }, [user]);

  if (registered === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!registered) {
    return <FlightRegistration onSuccess={() => setRegistered(true)} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      // Dashboard
      case "dashboard":
        return <FlightDashboard partnerId={pid} />;

      // Flights
      case "flight-list":
        return <FlightList partnerId={pid} />;
      case "flight-schedule":
        return <FlightSchedule partnerId={pid} />;

      // Routes
      case "route-list":
        return <RouteList partnerId={pid} />;
      case "route-analytics":
        return <RouteAnalytics partnerId={pid} />;

      // Pricing
      case "pricing-rules":
        return <PricingRules partnerId={pid} />;
      case "dynamic-pricing":
        return <DynamicPricing partnerId={pid} />;

      // Bookings
      case "booking-list":
        return <BookingList partnerId={pid} />;
      case "passenger-management":
        return <PassengerManagement partnerId={pid} />;
      case "check-in-management":
        return <CheckInManagement partnerId={pid} />;

      // Analytics
      case "analytics-dashboard":
        return <AnalyticsDashboard partnerId={pid} />;
      case "revenue-report":
        return <RevenueReport partnerId={pid} />;
      case "capacity-report":
        return <CapacityReport partnerId={pid} />;
      case "performance-metrics":
        return <PerformanceMetrics partnerId={pid} />;

      // Settings
      case "account-settings":
        return <AccountSettings />;
      case "notification-settings":
        return <NotificationSettings />;
      case "payout-settings":
        return <PayoutSettings />;

      default:
        return <FlightDashboard partnerId={pid} />;
    }
  };

  return (
    <FlightPortalLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </FlightPortalLayout>
  );
}
