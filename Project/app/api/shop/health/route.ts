import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/shop/utils";
import { testDatabaseConnection } from "@/lib/shop/supabaseServerClient";

export async function GET() {
  const dbHealthy = await testDatabaseConnection();

  return NextResponse.json({
    status: dbHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: dbHealthy ? "ok" : "error",
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/shop/health",
        description: "Shop: Health check",
      },
      {
        method: "GET",
        path: "/api/shop/products",
        description: "Shop: List products",
      },
      {
        method: "GET",
        path: "/api/shop/products/[slug]",
        description: "Shop: Get product details",
      },
      {
        method: "GET",
        path: "/api/shop/categories",
        description: "Shop: List categories",
      },
      { method: "GET", path: "/api/shop/cart", description: "Shop: Get cart" },
      {
        method: "POST",
        path: "/api/shop/cart/items",
        description: "Shop: Add to cart",
      },
      {
        method: "PATCH",
        path: "/api/shop/cart/items/[id]",
        description: "Shop: Update cart item",
      },
      {
        method: "DELETE",
        path: "/api/shop/cart/items/[id]",
        description: "Shop: Remove from cart",
      },
      {
        method: "POST",
        path: "/api/shop/cart/apply-coupon",
        description: "Shop: Apply coupon",
      },
      {
        method: "GET",
        path: "/api/shop/shipping-methods",
        description: "Shop: Get shipping methods",
      },
      {
        method: "POST",
        path: "/api/shop/checkout",
        description: "Shop: Create order",
      },
      {
        method: "GET",
        path: "/api/shop/orders",
        description: "Shop: List orders",
      },
      {
        method: "GET",
        path: "/api/shop/orders/[number]",
        description: "Shop: Get order details",
      },
      {
        method: "POST",
        path: "/api/shop/orders/[number]/cancel",
        description: "Shop: Cancel order",
      },
      {
        method: "GET",
        path: "/api/shop/wishlist",
        description: "Shop: Get wishlist",
      },
      {
        method: "POST",
        path: "/api/shop/wishlist/[productId]",
        description: "Shop: Add to wishlist",
      },
      {
        method: "DELETE",
        path: "/api/shop/wishlist/[productId]",
        description: "Shop: Remove from wishlist",
      },
      {
        method: "GET",
        path: "/api/shop/reviews",
        description: "Shop: List reviews",
      },
      {
        method: "POST",
        path: "/api/shop/reviews",
        description: "Shop: Create review",
      },
      {
        method: "GET",
        path: "/api/shop/vouchers/available",
        description: "Shop: Available vouchers",
      },
      {
        method: "GET",
        path: "/api/shop/vouchers/my",
        description: "Shop: My vouchers",
      },
      {
        method: "POST",
        path: "/api/shop/vouchers/redeem",
        description: "Shop: Redeem voucher",
      },
    ],
    meta: {
      request_id: generateRequestId(),
    },
  });
}
