// API Route: GET /api/dining/cart - Get user's cart
// POST /api/dining/cart - Add item to cart
// DELETE /api/dining/cart - Clear cart

import { NextRequest, NextResponse } from "next/server";
import {
  cartService,
  CreateCartItemRequest,
} from "@/lib/dining/services/cartService";

export async function GET(request: NextRequest) {
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

    const cart = await cartService.getUserCart(userId);
    const count = await cartService.getCartCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        items: cart,
        count,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/dining/cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch cart",
      },
      { status: 500 },
    );
  }
}

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

    const body: CreateCartItemRequest = await request.json();

    if (
      !body.venue_id ||
      !body.reservation_date ||
      !body.reservation_time ||
      !body.guest_count
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: venue_id, reservation_date, reservation_time, guest_count",
        },
        { status: 400 },
      );
    }

    const cartItem = await cartService.addToCart(body, userId);

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add item to cart",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: cartItem,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/dining/cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add to cart",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const success = await cartService.clearCart(userId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to clear cart",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/dining/cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to clear cart",
      },
      { status: 500 },
    );
  }
}
