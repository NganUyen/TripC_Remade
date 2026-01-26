# Clerk + Supabase Integration Setup Guide

This guide follows [Clerk's official Supabase integration documentation](https://clerk.com/docs/guides/development/integrations/databases/supabase).

## 📋 Overview

This integration connects Clerk authentication with Supabase database, using:

- **Clerk session tokens** to authenticate Supabase requests
- **Row Level Security (RLS)** policies to protect data
- **Webhooks** to sync user profiles to Supabase

## 🚀 Setup Steps

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: TripC
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait 2-3 minutes for project creation

### Step 2: Set Up Clerk as Third-Party Auth Provider

**In Clerk Dashboard:**

1. Go to [Clerk Dashboard > Supabase Integration](https://dashboard.clerk.com/setup/supabase)
2. Select your configuration options
3. Click **"Activate Supabase integration"**
4. Copy your **Clerk domain** (e.g., `your-app.clerk.accounts.dev`)

**In Supabase Dashboard:**

1. Navigate to **[Authentication > Sign In / Up](https://supabase.com/dashboard/project/_/auth/third-party)**
2. Click **"Add provider"**
3. Select **"Clerk"** from the provider list
4. Paste your Clerk domain
5. Click **"Save"**

✅ This allows Supabase to trust Clerk's JWT tokens!

### Step 3: Get Supabase API Credentials

1. In Supabase dashboard, go to **[Settings > API](https://supabase.com/dashboard/project/_/settings/api)**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep secret!

### Step 4: Update Environment Variables

Open `Project/.env.local` and replace the placeholder values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

⚠️ **Important**: The `NEXT_PUBLIC_` prefix is required for client-side variables.

### Step 5: Run Database Schema

1. In Supabase dashboard, go to **[SQL Editor](https://supabase.com/dashboard/project/_/sql/new)**
2. Click **"New Query"**
3. Open the file: `Project/docs/supabase-schema.sql`
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for ✅ "Success. No rows returned"

This creates:

- ✅ `users` table (with Clerk ID)
- ✅ `bookings` table (with RLS)
- ✅ `wishlist` table (with RLS)
- ✅ `reviews` table (with RLS)
- ✅ RLS policies that use `auth.jwt()->>'sub'`

### Step 6: Configure Clerk Webhook (for User Sync)

#### Get Webhook Endpoint URL

**For Development:**

1. Install [ngrok](https://ngrok.com/download)
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**For Production:**

- Use your actual domain: `https://your-domain.com`

#### Set Up Webhook in Clerk

1. Go to [Clerk Dashboard > Webhooks](https://dashboard.clerk.com)
2. Click **"Add Endpoint"**
3. Enter:
   - **Endpoint URL**:
     - Dev: `https://abc123.ngrok.io/api/webhooks/clerk`
     - Prod: `https://your-domain.com/api/webhooks/clerk`
   - **Subscribe to events**:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
4. Click **"Create"**
5. Copy the **Signing Secret** (starts with `whsec_...`)

#### Add Webhook Secret

Update `Project/.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_signing_secret_here
```

### Step 7: Create Clerk JWT Template (Required!)

1. In Clerk Dashboard, go to **[JWT Templates](https://dashboard.clerk.com/last-active?path=jwt-templates)**
2. Click **"New template"**
3. Select **"Supabase"** from the template list
4. Name it: `supabase`
5. Click **"Apply changes"**

This adds the `"role": "authenticated"` claim required by Supabase.

### Step 8: Test the Integration

#### Start Development Servers

**Terminal 1 - Next.js:**

```bash
cd Project
npm run dev
```

**Terminal 2 - ngrok (if testing webhooks locally):**

```bash
ngrok http 3000
```

#### Create Test User

1. Open: `http://localhost:3000`
2. Click **"Sign Up"**
3. Create a new account
4. Complete registration

#### Verify in Supabase

1. Go to Supabase dashboard
2. Navigate to **[Table Editor > users](https://supabase.com/dashboard/project/_/editor/users)**
3. You should see your new user! ✨

## 🎯 How It Works

### Authentication Flow

```
User signs in with Clerk
         ↓
Clerk issues JWT with "sub" claim (user ID)
         ↓
Frontend uses Clerk session token
         ↓
Supabase validates token (third-party auth)
         ↓
RLS policies filter data using auth.jwt()->>'sub'
         ↓
User can only access their own data
```

### Data Sync Flow

```
User created/updated in Clerk
         ↓
Clerk sends webhook to /api/webhooks/clerk
         ↓
Webhook syncs data to Supabase users table
         ↓
Extended profile data available (membership tier, tcent, etc.)
```

## 💻 Usage Examples

### Example 1: Get Current User

```tsx
"use client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function ProfileCard() {
  const { clerkUser, supabaseUser, isLoading } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!supabaseUser) return <div>Please sign in</div>;

  return (
    <div>
      <h2>{supabaseUser.name}</h2>
      <p>Email: {supabaseUser.email}</p>
      <p>Membership: {supabaseUser.membership_tier}</p>
      <p>Tcent Balance: {supabaseUser.tcent_balance}</p>
    </div>
  );
}
```

### Example 2: Create a Booking

```tsx
"use client";
import { useBookings } from "@/lib/hooks/useBookings";

export function BookButton() {
  const { createBooking } = useBookings();

  const handleBook = async () => {
    await createBooking({
      booking_type: "hotel",
      title: "Luxury Beach Resort",
      start_date: new Date("2026-02-01").toISOString(),
      end_date: new Date("2026-02-05").toISOString(),
      price: 299.99,
      status: "confirmed",
      currency: "USD",
    });
    alert("Booking created!");
  };

  return <button onClick={handleBook}>Book Now</button>;
}
```

### Example 3: Wishlist Toggle

```tsx
"use client";
import { useWishlist } from "@/lib/hooks/useWishlist";

export function WishlistButton({ hotelId, hotelName, price }: any) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(hotelId);

  const handleToggle = async () => {
    await toggleWishlist({
      item_id: hotelId,
      item_type: "hotel",
      title: hotelName,
      price: price,
      image_url: null,
    });
  };

  return (
    <button onClick={handleToggle}>
      {isFavorite ? "❤️ Saved" : "🤍 Save"}
    </button>
  );
}
```

### Example 4: Display Bookings List

```tsx
"use client";
import { useBookings } from "@/lib/hooks/useBookings";

export function MyBookings() {
  const { bookings, isLoading, cancelBooking } = useBookings();

  if (isLoading) return <div>Loading bookings...</div>;

  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id}>
            <h3>{booking.title}</h3>
            <p>Type: {booking.booking_type}</p>
            <p>Status: {booking.status}</p>
            <p>Price: ${booking.price}</p>
            {booking.status !== "cancelled" && (
              <button onClick={() => cancelBooking(booking.id)}>Cancel</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that:

- ✅ Users can only view their own data
- ✅ Users can only insert records for themselves
- ✅ Users can only update/delete their own records
- ✅ Authentication is enforced at database level

### How RLS Works

```sql
-- Example: Users can only see their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));
```

The `auth.jwt()->>'sub'` extracts the Clerk user ID from the session token.

### API Keys

- **anon/public key**: Safe for client-side use (RLS enforced)
- **service_role key**: Server-side only (bypasses RLS)

## 🔄 Real-time Features

Enable real-time updates by uncommenting in `supabase-schema.sql`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist;
```

The hooks automatically subscribe to changes:

```tsx
// Bookings automatically update when changed
const { bookings } = useBookings();

// Wishlist automatically updates when items added/removed
const { wishlist } = useWishlist();
```

## 🐛 Troubleshooting

### "Missing environment variable"

- ✅ Check all Supabase variables are in `.env.local`
- ✅ Restart dev server after adding variables

### "Webhook verification failed"

- ✅ Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- ✅ Check ngrok URL is correct in Clerk webhook settings

### "User not appearing in Supabase"

- ✅ Ensure webhook events are enabled in Clerk
- ✅ Check webhook logs in Clerk dashboard
- ✅ Look for errors in terminal

### "Row Level Security policy violation"

- ✅ Verify you ran the full schema SQL
- ✅ Check Clerk JWT template is created
- ✅ Ensure "Supabase" template is named exactly `supabase`

### "Could not get a valid token from useSession()"

- ✅ Create Clerk JWT template named `supabase`
- ✅ Clear browser cache and sign in again

## ✅ Setup Checklist

- [ ] Created Supabase project
- [ ] Activated Clerk as third-party auth in Supabase
- [ ] Added Supabase credentials to `.env.local`
- [ ] Ran database schema in Supabase SQL Editor
- [ ] Created Clerk JWT template named `supabase`
- [ ] Configured Clerk webhook endpoint
- [ ] Added webhook secret to `.env.local`
- [ ] Started development server
- [ ] (Optional) Started ngrok for local webhook testing
- [ ] Created test user and verified in Supabase
- [ ] Tested creating a booking
- [ ] Tested wishlist functionality

## 📚 Resources

- [Clerk Official Supabase Guide](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Example Repository](https://github.com/clerk/clerk-supabase-nextjs)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/overview)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks)

## 🎉 You're Done!

Your Clerk authentication is now fully integrated with Supabase following the official documentation! Users will automatically sync, and all data access is secured with RLS policies.
