"use client";

import { FlightPortal } from "@/components/partner/flight/FlightPortal";
import { FlightPartnerGuard } from "@/components/partner/flight/shared/FlightPartnerGuard";

export default function FlightPortalPage() {
  return (
    <FlightPartnerGuard requireApproved>
      <FlightPortal />
    </FlightPartnerGuard>
  );
}
