import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/hotels(.*)",
  "/flights(.*)",
  "/dining(.*)",
  "/activities(.*)",
  "/events(.*)",
  "/wellness(.*)",
  "/beauty(.*)",
  "/entertainment(.*)",
  "/shop(.*)",
  "/transport(.*)",
  "/vouchers(.*)",
  "/help-center(.*)",
  "/my-bookings(.*)",
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/rewards(.*)",
  "/wishlist(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Explicitly protect routes that require authentication
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
  // For other routes (not public, not explicitly protected), don't enforce
  // This allows flexibility for semi-public features
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
