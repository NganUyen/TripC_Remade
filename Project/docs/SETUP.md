# TripC SuperApp - Setup Guide

## Authentication Setup with Clerk & Convex

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Get Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or select existing one
3. Go to **API Keys** section
4. Copy your **Publishable Key** and **Secret Key**

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory (use `.env.local.example` as template)
2. Add your Clerk credentials:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (customize if needed)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

3. The Convex variables should already be set from the initialization:

```env
# Convex
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...
```

### Step 3: Configure Clerk Settings

In your Clerk Dashboard:

1. **Enable Social Providers** (optional):
   - Go to **User & Authentication** → **Social Connections**
   - Enable Google, GitHub, etc.

2. **Customize Appearance** (optional):
   - Go to **Customization** → **Appearance**
   - Your app already has custom theme settings in the code

3. **Set up Webhooks** (optional, for production):
   - Go to **Webhooks**
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to `user.created` and `user.updated` events

### Step 4: Start Development Servers

Open **two terminal windows**:

**Terminal 1 - Start Convex backend:**

```bash
npx convex dev
```

**Terminal 2 - Start Next.js app:**

```bash
npm run dev
```

### Step 5: Test Authentication

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Sign In" button in the header
3. Create a new account or sign in
4. Your user data will automatically sync to Convex database

## Project Structure

```
├── app/
│   ├── sign-in/          # Clerk sign-in page
│   ├── sign-up/          # Clerk sign-up page
│   └── layout.tsx        # Root layout with Providers
├── components/
│   ├── Providers.tsx     # Clerk + Convex providers
│   ├── SyncUser.tsx      # Auto-sync Clerk user to Convex
│   └── Header.tsx        # Updated with Clerk auth
├── convex/
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User queries/mutations
│   ├── bookings.ts       # Booking management
│   └── wishlist.ts       # Wishlist features
├── lib/
│   └── hooks/
│       ├── useCurrentUser.ts   # Get current authenticated user
│       ├── useBookings.ts      # Booking hooks
│       └── useWishlist.ts      # Wishlist hooks
└── middleware.ts         # Clerk authentication middleware
```

## Using Authentication in Your App

### Get Current User

```tsx
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

function MyComponent() {
  const { clerkUser, convexUser, isAuthenticated } = useCurrentUser();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return <div>Hello {clerkUser?.firstName}!</div>;
}
```

### Use Bookings

```tsx
import { useBookings } from "@/lib/hooks/useBookings";

function BookingsPage() {
  const { bookings, createBooking } = useBookings();

  const handleBook = async () => {
    await createBooking({
      userId: convexUser._id,
      type: "hotel",
      title: "Luxury Hotel Stay",
      startDate: Date.now(),
      price: 299,
    });
  };

  return <div>{bookings?.length} bookings</div>;
}
```

### Use Wishlist

```tsx
import { useWishlist } from "@/lib/hooks/useWishlist";

function WishlistButton({ itemId, itemType, title }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(itemId);

  return (
    <button onClick={() => toggleWishlist({ itemId, itemType, title })}>
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </button>
  );
}
```

## Protected Routes

Routes are configured in `middleware.ts`. By default:

- **Public routes**: Home, browse pages (hotels, flights, etc.), help center
- **Protected routes**: Profile, bookings, wishlist, rewards

To add more protected routes, update the `isPublicRoute` matcher in `middleware.ts`.

## Database Schema

The app uses these Convex tables:

- **users**: Synced from Clerk, contains user profile data
- **bookings**: All user bookings (hotels, flights, activities, etc.)
- **wishlist**: Saved items across all categories
- **reviews**: User reviews for items

## Next Steps

1. Customize Clerk appearance in `components/Providers.tsx`
2. Add more Convex functions in `convex/` directory
3. Implement booking creation in your booking pages
4. Add wishlist functionality to product cards
5. Set up Clerk webhooks for production

## Troubleshooting

### "Clerk API key is missing"

- Make sure `.env.local` exists with your Clerk keys
- Restart the dev server after adding environment variables

### "Convex deployment not found"

- Run `npx convex dev` before starting Next.js
- Check that `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`

### User not syncing to Convex

- Check browser console for errors
- Verify `SyncUser` component is in your layout
- Ensure Convex dev server is running

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
