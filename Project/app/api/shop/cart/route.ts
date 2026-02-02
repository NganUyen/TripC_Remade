import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  getOrCreateCart,
  getDbUserId,
} from "@/lib/shop";

import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return errorResponse("UNAUTHORIZED", "Missing auth", 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
      return errorResponse("USER_NOT_FOUND", "User record not found", 404);
    }

    const cart = await getOrCreateCart(userId);
    return successResponse(cart);
  } catch (error) {
    console.error("Cart GET error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch cart", 500);
  }
}
