"use client";

import React, { useState } from "react";
import FlightPortalLayout from "./FlightPortalLayout";
import FlightDashboard from "./FlightDashboard";

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

export default function FlightPortal() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  // TODO: Replace with actual partner ID from authentication
  const partnerId = "00000000-0000-0000-0000-000000000001";

  const renderContent = () => {
    switch (activeSection) {
      // Dashboard
      case "dashboard":
        return <FlightDashboard partnerId={partnerId} />;

      // Flights
      case "flight-list":
        return <FlightList partnerId={partnerId} />;
      case "flight-schedule":
        return <FlightSchedule />;

      // Routes
      case "route-list":
        return <RouteList partnerId={partnerId} />;
      case "route-analytics":
        return <RouteAnalytics />;

      // Pricing
      case "pricing-rules":
        return <PricingRules />;
      case "dynamic-pricing":
        return <DynamicPricing />;

      // Bookings
      case "booking-list":
        return <BookingList partnerId={partnerId} />;
      case "passenger-management":
        return <PassengerManagement />;
      case "check-in-management":
        return <CheckInManagement />;

      // Analytics
      case "analytics-dashboard":
        return <AnalyticsDashboard />;
      case "revenue-report":
        return <RevenueReport />;
      case "capacity-report":
        return <CapacityReport />;
      case "performance-metrics":
        return <PerformanceMetrics />;

      // Settings
      case "account-settings":
        return <AccountSettings />;
      case "notification-settings":
        return <NotificationSettings />;
      case "payout-settings":
        return <PayoutSettings />;

      default:
        return <FlightDashboard partnerId={partnerId} />;
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

export { FlightPortal };
