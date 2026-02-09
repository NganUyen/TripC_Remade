"use client";

import { useSearchParams } from "next/navigation";
import { UnifiedCheckoutContainer } from "@/components/checkout/unified-checkout-container";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function EntertainmentCheckoutContent() {
    const searchParams = useSearchParams();

    // Extract query params (same pattern as Events)
    const itemId = searchParams.get("itemId");
    const sessionId = searchParams.get("sessionId");
    const ticketTypeId = searchParams.get("ticketTypeId");
    const quantity = parseInt(searchParams.get("quantity") || "1");

    // Validate required params
    if (!itemId || !ticketTypeId) {
        return (
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md px-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Missing Booking Information
                    </h1>
                    <p className="text-slate-500">
                        Required booking details are missing. Please select an entertainment item and ticket type first.
                    </p>
                    <Link
                        href="/entertainment"
                        className="inline-flex items-center gap-2 text-[#FF5E1F] font-medium hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Browse Entertainment
                    </Link>
                </div>
            </main>
        );
    }

    const voucherCode = searchParams.get("voucherCode");
    const discountAmount = parseFloat(searchParams.get("discountAmount") || "0");

    // Build initialData for UnifiedCheckoutContainer (following Events pattern)
    const initialData = {
        itemId: itemId,
        sessionId: sessionId || undefined,
        ticketTypeId: ticketTypeId,
        quantity: quantity,
        voucherCode: voucherCode || undefined,
        discountAmount: discountAmount || 0,
    };

    return (
        <UnifiedCheckoutContainer
            serviceType="entertainment"
            initialData={initialData}
        />
    );
}

export default function EntertainmentCheckoutPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
                    <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                    <div className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                </div>
            </main>
        }>
            <EntertainmentCheckoutContent />
        </Suspense>
    );
}
