// API Route: POST /api/dining/cart/checkout - Checkout cart and create reservations

import { NextRequest, NextResponse } from "next/server";
import { cartService } from "@/lib/dining/services/cartService";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { guest_name, guest_phone, guest_email } = body;

    if (!guest_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest name is required",
        },
        { status: 400 },
      );
    }

    const result = await cartService.checkoutCart(userId, {
      guest_name,
      guest_phone,
      guest_email,
    });

    if (!result.success && result.reservations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create any reservations",
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reservations: result.reservations,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
      message: `Successfully created ${result.reservations.length} reservation(s)`,
    });
  } catch (error: any) {
    console.error("Error in POST /api/dining/cart/checkout:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to checkout cart",
      },
      { status: 500 },
    );
  }
}
