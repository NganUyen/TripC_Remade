import { NextRequest } from "next/server";
import { paginatedResponse, errorResponse } from "@/lib/shop/utils";
import { getOrders, getDbUserId } from "@/lib/shop";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return errorResponse("UNAUTHORIZED", "Must be logged in", 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
      return errorResponse("USER_NOT_FOUND", "User record not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;

    const { data: orders, total } = await getOrders(userId, {
      limit,
      offset,
      status,
    });

    // Format summaries
    const summaries = orders.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      payment_status: o.payment_status,
      grand_total: o.grand_total,
      item_count: o.items?.length || 0,
      created_at: o.created_at,
    }));

    return paginatedResponse(summaries, total, limit, offset);
  } catch (error) {
    console.error("Orders API error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch orders", 500);
  }
}
