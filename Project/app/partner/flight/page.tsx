"use client";

import { FlightPortal } from "@/components/partner/flight/FlightPortal";
import { PartnerAuthGuard } from "@/components/partner/PartnerAuthGuard";

export default function FlightPortalPage() {
  return (
    <PartnerAuthGuard portalName="Flight Portal">
      <FlightPortal />
    </PartnerAuthGuard>
  );
}
