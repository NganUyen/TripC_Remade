# 🎯 Quick Reference Card

## Essential Commands

```bash
# Start Development (Run in 2 terminals)
npx convex dev           # Terminal 1: Backend
npm run dev              # Terminal 2: Frontend

# Build & Deploy
npm run build            # Build Next.js
npx convex deploy        # Deploy Convex
```

## Important URLs

| Service              | URL                                              |
| -------------------- | ------------------------------------------------ |
| **Local App**        | http://localhost:3000                            |
| **Convex Dashboard** | https://dashboard.convex.dev/d/fearless-gnat-622 |
| **Clerk Dashboard**  | https://dashboard.clerk.com                      |

## File Locations

```
.env.local              ← Add your Clerk keys here
middleware.ts           ← Configure protected routes
convex/schema.ts        ← Database schema
components/Providers.tsx ← Auth configuration
```

## Common Hooks

```typescript
// Get current user
const { clerkUser, convexUser, isAuthenticated } = useCurrentUser();

// Manage bookings
const { bookings, createBooking } = useBookings();

// Manage wishlist
const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
```

## Quick Fixes

| Problem                   | Solution                                 |
| ------------------------- | ---------------------------------------- |
| "Clerk key missing"       | Add keys to `.env.local`, restart server |
| "Can't connect to Convex" | Run `npx convex dev`                     |
| "Module not found"        | Wait for Convex to generate types (~10s) |
| Changes not showing       | Hard refresh (Ctrl+Shift+R)              |

## Environment Variables Template

```env
# Convex (already set)
CONVEX_DEPLOYMENT=dev:fearless-gnat-622
NEXT_PUBLIC_CONVEX_URL=https://fearless-gnat-622.convex.cloud

# Clerk (YOU NEED TO ADD THESE)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Protected Routes (Require Login)

- `/profile`
- `/my-bookings`
- `/wishlist`
- `/rewards`
- `/profile/settings`

## Public Routes (No Login Required)

- `/` (home)
- `/hotels`, `/flights`, `/dining`, etc.
- `/help-center`
- `/sign-in`, `/sign-up`

## Component Examples

### Use Authentication

```tsx
"use client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function MyComponent() {
  const { isAuthenticated } = useCurrentUser();
  if (!isAuthenticated) return <SignIn />;
  return <div>Protected Content</div>;
}
```

### Use Wishlist Button

```tsx
import { WishlistButton } from "@/components/WishlistButton";

<WishlistButton itemId="123" itemType="hotel" title="Resort" />;
```

### Display Bookings

```tsx
import { BookingsList } from "@/components/bookings/BookingsList";

<BookingsList />;
```

## Documentation Index

| Doc                    | Purpose                        |
| ---------------------- | ------------------------------ |
| **README.md**          | Project overview & quick start |
| **CHECKLIST.md**       | Complete setup steps           |
| **QUICKSTART.md**      | Code examples & usage          |
| **SETUP.md**           | Detailed configuration         |
| **ARCHITECTURE.md**    | System design diagrams         |
| **TROUBLESHOOTING.md** | Problem solving                |
| **SUMMARY.md**         | What was installed             |

## Support

- 📖 Read the docs (start with CHECKLIST.md)
- 🔍 Check TROUBLESHOOTING.md
- 💬 [Clerk Discord](https://clerk.com/discord)
- 💬 [Convex Discord](https://convex.dev/community)

---

**Save this file for quick reference!** 📌
