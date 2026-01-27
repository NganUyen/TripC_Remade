// API Route: PUT /api/dining/cart/[id] - Update cart item
// DELETE /api/dining/cart/[id] - Remove item from cart

import { NextRequest, NextResponse } from "next/server";
import {
  cartService,
  CreateCartItemRequest,
} from "@/lib/dining/services/cartService";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
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

    const body: Partial<CreateCartItemRequest> = await request.json();

    const cartItem = await cartService.updateCartItem(id, body, userId);

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update cart item or item not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: cartItem,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/dining/cart/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update cart item",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
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

    const success = await cartService.removeFromCart(id, userId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to remove item from cart",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/dining/cart/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove cart item",
      },
      { status: 500 },
    );
  }
}
