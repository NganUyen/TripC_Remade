# Quick Start Guide - Authentication Setup

## ✅ What's Been Configured

### 1. **Packages Installed**

- `@clerk/nextjs` - Authentication UI and hooks
- `convex` - Real-time database and backend

### 2. **Convex Database Created**

Your Convex project is set up with these tables:

- **users** - User profiles synced from Clerk
- **bookings** - All reservations (hotels, flights, etc.)
- **wishlist** - Saved items
- **reviews** - User reviews

### 3. **Files Created/Modified**

**Configuration:**

- `middleware.ts` - Protects routes requiring authentication
- `.env.local.example` - Template for environment variables

**Convex Functions:**

- `convex/schema.ts` - Database schema
- `convex/users.ts` - User management
- `convex/bookings.ts` - Booking operations
- `convex/wishlist.ts` - Wishlist operations

**Components:**

- `components/Providers.tsx` - Clerk + Convex providers
- `components/SyncUser.tsx` - Auto-sync users to Convex
- `components/Header.tsx` - Updated with Clerk authentication
- `components/WishlistButton.tsx` - Example component with auth
- `components/bookings/BookingsList.tsx` - Example bookings component

**Hooks:**

- `lib/hooks/useCurrentUser.ts` - Get authenticated user
- `lib/hooks/useBookings.ts` - Booking management
- `lib/hooks/useWishlist.ts` - Wishlist management

**Pages:**

- `app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `app/layout.tsx` - Updated with providers

**Documentation:**

- `SETUP.md` - Complete setup instructions

## 🚀 Next Steps

### 1. Get Your Clerk API Keys

1. Visit: https://dashboard.clerk.com
2. Create a new application
3. Copy your keys from the **API Keys** section

### 2. Update Environment Variables

Check if `.env.local` exists and add your Clerk keys:

```bash
# In your project root
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

The Convex variables should already be there.

### 3. Start Development

**Terminal 1 - Convex Backend:**

```bash
npx convex dev
```

**Terminal 2 - Next.js App:**

```bash
npm run dev
```

### 4. Test Authentication

1. Go to http://localhost:3000
2. Click "Sign In" in the header
3. Create an account or sign in
4. Your user will automatically sync to Convex!

## 🔧 Usage Examples

### Get Current User in Any Component

```tsx
"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function MyComponent() {
  const { clerkUser, convexUser, isAuthenticated } = useCurrentUser();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {clerkUser?.firstName}!</div>;
}
```

### Add Wishlist Functionality

```tsx
import { WishlistButton } from "@/components/WishlistButton";

<WishlistButton
  itemId="hotel-123"
  itemType="hotel"
  title="Luxury Beach Resort"
  imageUrl="https://..."
  price={299}
/>;
```

### Work with Bookings

```tsx
"use client";

import { useBookings } from "@/lib/hooks/useBookings";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function BookNowButton() {
  const { convexUser } = useCurrentUser();
  const { createBooking } = useBookings();

  const handleBook = async () => {
    if (!convexUser) return;

    await createBooking({
      userId: convexUser._id,
      type: "hotel",
      title: "Beach Resort Stay",
      startDate: Date.now(),
      price: 299,
      imageUrl: "https://...",
    });
  };

  return <button onClick={handleBook}>Book Now</button>;
}
```

### Display User's Bookings

```tsx
import { BookingsList } from "@/components/bookings/BookingsList";

export default function MyBookingsPage() {
  return (
    <div>
      <h1>My Bookings</h1>
      <BookingsList />
    </div>
  );
}
```

## 🛡️ Protected Routes

By default, these routes require authentication:

- `/profile`
- `/my-bookings`
- `/wishlist`
- `/rewards`
- `/profile/settings`

Public routes (no authentication needed):

- `/` (home)
- `/hotels`, `/flights`, `/dining`, etc.
- `/help-center`
- `/sign-in`, `/sign-up`

To modify protected routes, edit `middleware.ts`.

## 📚 Important Documentation

- **Full Setup Guide**: See `SETUP.md`
- **Clerk Docs**: https://clerk.com/docs
- **Convex Docs**: https://docs.convex.dev

## ⚠️ Troubleshooting

**"Environment variables not found"**

- Restart dev server after adding `.env.local`
- Make sure file is named exactly `.env.local`

**"Cannot connect to Convex"**

- Run `npx convex dev` in a separate terminal
- Check that both servers are running

**"User not syncing"**

- Check browser console for errors
- Verify Convex dev server is running
- Try signing out and back in

## 💡 Tips

1. Keep both `npx convex dev` and `npm run dev` running
2. Changes to Convex functions auto-reload
3. Use the Convex dashboard to view your data
4. Clerk provides a user management dashboard
5. Test with different user accounts

---

**Need help?** Check the full `SETUP.md` guide or visit the documentation links above!
