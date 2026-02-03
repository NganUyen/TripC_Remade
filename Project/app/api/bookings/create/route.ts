import { NextRequest, NextResponse } from "next/server";
import { CheckoutService } from "@/lib/checkout/services/checkout.service";
import { currentUser } from "@clerk/nextjs/server";
import { CheckoutPayload } from "@/lib/checkout/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const payload = await req.json();

        console.log("[Booking API] Received payload:", JSON.stringify(payload, null, 2));

        // Resolve User ID
        let userId = payload.userId;
        if (!userId && user) {
            userId = user.id; // Clerk ID, service resolves to UUID
        } else if (!userId) {
            userId = "GUEST";
        }

        // Map 'category' (frontend) to 'serviceType' (CheckoutPayload)
        // The frontend sends 'category', but the type expects 'serviceType'.
        // We'll normalize it here.
        const serviceType = payload.category || payload.serviceType;

        if (!serviceType) {
            return NextResponse.json(
                { error: "Missing serviceType or category" },
                { status: 400 }
            );
        }

        const checkoutPayload: CheckoutPayload = {
            ...payload,
            userId,
            serviceType: serviceType,
        };

        const checkoutService = new CheckoutService();
        const result = await checkoutService.createBooking(checkoutPayload);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Booking API] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}
