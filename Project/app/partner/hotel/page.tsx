"use client";

import { HotelPortal } from "@/components/partner/hotel/HotelPortal";
import { HotelPartnerGuard } from "@/components/partner/hotel/shared/HotelPartnerGuard";

export default function HotelPortalPage() {
  return (
    <HotelPartnerGuard requireApproved>
      <HotelPortal />
    </HotelPartnerGuard>
  );
}
