# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TripC SuperApp                           │
│                     (Next.js 14 App Router)                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                    ┌────────────┴───────────┐
                    │                        │
                    ▼                        ▼
        ┌───────────────────┐    ┌──────────────────┐
        │   Clerk Auth      │    │  Convex Backend  │
        │   (Frontend)      │    │  (Database +     │
        │                   │    │   Functions)     │
        │ • Sign In/Up UI   │    │                  │
        │ • Session Mgmt    │    │ • Users          │
        │ • User Profile    │    │ • Bookings       │
        │ • JWT Tokens      │    │ • Wishlist       │
        └───────────────────┘    │ • Reviews        │
                                 └──────────────────┘
```

## Data Flow

### 1. User Sign In Flow

```
User clicks "Sign In"
       │
       ▼
Clerk Modal Opens
       │
       ▼
User Authenticates
(Email/Password or Social)
       │
       ▼
Clerk Creates Session
       │
       ▼
JWT Token Stored
       │
       ▼
SyncUser Component Triggered
       │
       ▼
User Data Sent to Convex
       │
       ▼
Convex Stores User Record
       │
       ▼
App Re-renders with Auth State
```

### 2. Creating a Booking Flow

```
User clicks "Book Now"
       │
       ▼
useBookings hook
       │
       ▼
createBooking mutation
       │
       ▼
JWT sent to Convex (automatic)
       │
       ▼
Convex verifies auth
       │
       ▼
Booking saved to database
       │
       ▼
UI updates automatically (real-time)
       │
       ▼
User sees confirmation
```

### 3. Wishlist Toggle Flow

```
User clicks Wishlist ❤️
       │
       ▼
useWishlist hook
       │
       ▼
Check if item exists
       │
       ├─ If exists ──────┐
       │                  ▼
       │         Remove from wishlist
       │                  │
       └─ If not exists ──┤
                          ▼
                 Add to wishlist
                          │
                          ▼
                 UI updates (real-time)
```

## File Structure & Responsibilities

```
TripC Project
│
├── app/                           # Next.js Pages
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home page
│   ├── sign-in/                   # Clerk sign-in
│   ├── sign-up/                   # Clerk sign-up
│   ├── my-bookings/              # Protected - user bookings
│   ├── wishlist/                 # Protected - user wishlist
│   └── profile/                  # Protected - user profile
│
├── components/
│   ├── Providers.tsx             # 🔑 Clerk + Convex providers
│   ├── SyncUser.tsx              # 🔄 Auto-sync users
│   ├── Header.tsx                # 🎯 Clerk auth UI
│   ├── WishlistButton.tsx        # ❤️  Wishlist with auth
│   └── bookings/
│       └── BookingsList.tsx      # 📋 Display bookings
│
├── convex/                        # 🗄️ Backend
│   ├── schema.ts                 # Database schema
│   ├── users.ts                  # User CRUD operations
│   ├── bookings.ts               # Booking operations
│   ├── wishlist.ts               # Wishlist operations
│   └── _generated/               # Auto-generated types
│
├── lib/hooks/                     # 🎣 Custom React Hooks
│   ├── useCurrentUser.ts         # Get auth user
│   ├── useBookings.ts            # Booking management
│   └── useWishlist.ts            # Wishlist management
│
├── middleware.ts                  # 🛡️ Route protection
└── .env.local                    # 🔐 Secrets (API keys)
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│ app/layout.tsx (Root Layout)                            │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │ <Providers>                                   │    │
│  │                                               │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ ClerkProvider                       │    │    │
│  │  │                                     │    │    │
│  │  │  ┌───────────────────────────┐    │    │    │
│  │  │  │ ConvexProviderWithClerk   │    │    │    │
│  │  │  │                           │    │    │    │
│  │  │  │  <SyncUser />            │    │    │    │
│  │  │  │  <Header />              │    │    │    │
│  │  │  │  <CategorySlider />      │    │    │    │
│  │  │  │  {children}              │    │    │    │
│  │  │  │  <ChatWidget />          │    │    │    │
│  │  │  │                           │    │    │    │
│  │  │  └───────────────────────────┘    │    │    │
│  │  │                                     │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│          │         │          │         │          │
│  Browser │────────▶│  Clerk   │────────▶│   JWT    │
│          │  Login  │  Server  │  Token  │  Token   │
│          │         │          │         │          │
└──────────┘         └──────────┘         └────┬─────┘
     │                                          │
     │                                          │
     │         ┌──────────────────────────────┘
     │         │
     ▼         ▼
┌────────────────────┐         ┌──────────────────┐
│                    │  Auth   │                  │
│  Next.js App      │────────▶│  Convex Backend  │
│  (with JWT)       │ Request │  (Verify JWT)    │
│                    │         │                  │
└────────────────────┘         └──────────────────┘
```

## Hook Usage Pattern

```typescript
// In any component
"use client"

import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useBookings } from '@/lib/hooks/useBookings'

export function MyComponent() {
  // Get current user
  const { clerkUser, convexUser, isAuthenticated } = useCurrentUser()

  // Get bookings (automatically filtered by user)
  const { bookings, createBooking } = useBookings()

  // Use them!
  if (!isAuthenticated) return <SignIn />

  return (
    <div>
      <h1>Welcome {clerkUser?.firstName}!</h1>
      <p>You have {bookings?.length} bookings</p>
    </div>
  )
}
```

## Database Schema Visual

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ _id (auto)      │───┐
│ clerkId         │   │
│ email           │   │
│ name            │   │
│ imageUrl        │   │
└─────────────────┘   │
                      │
                      │ userId (foreign key)
                      │
         ┌────────────┼────────────┬─────────────┐
         │            │            │             │
         ▼            ▼            ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐
│   bookings   │ │ wishlist │ │  reviews │ │   ...   │
├──────────────┤ ├──────────┤ ├──────────┤ └─────────┘
│ _id          │ │ _id      │ │ _id      │
│ userId       │ │ userId   │ │ userId   │
│ type         │ │ itemType │ │ itemType │
│ title        │ │ itemId   │ │ itemId   │
│ startDate    │ │ title    │ │ rating   │
│ price        │ │ price    │ │ comment  │
│ status       │ └──────────┘ └──────────┘
└──────────────┘
```

## Request/Response Flow

### Making an Authenticated Request

```
1. Component renders
   ↓
2. useQuery/useMutation hook called
   ↓
3. Convex React client reads JWT from Clerk
   ↓
4. Request sent to Convex with JWT in header
   ↓
5. Convex validates JWT
   ↓
6. Convex executes query/mutation
   ↓
7. Response returned to component
   ↓
8. Component re-renders with new data
```

## Real-time Updates

```
User A                    Convex                    User B
  │                         │                         │
  ├─ Creates booking ──────▶│                         │
  │                         ├─ Stores in DB           │
  │                         │                         │
  │                         ├─ Notifies subscribers ─▶│
  │                         │                         │
  │◀─ Confirmation          │                         │
  │                         │                         ▼
  │                         │                    Updates UI
  │                         │                    (real-time!)
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Middleware (middleware.ts)             │
│ • Protects routes before page load              │
│ • Redirects unauthenticated users               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 2: Clerk Provider                         │
│ • Manages session state                         │
│ • Provides JWT tokens                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 3: Convex Auth                            │
│ • Verifies JWT on every request                 │
│ • Ensures user permissions                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 4: Application Logic                     │
│ • Custom authorization rules                    │
│ • Business logic validation                     │
└─────────────────────────────────────────────────┘
```

## Development vs Production

### Development

```
Your Machine
├── Terminal 1: npx convex dev (localhost)
├── Terminal 2: npm run dev (localhost:3000)
└── Browser: http://localhost:3000
```

### Production

```
Vercel (Next.js)
├── https://yourdomain.com
└── Connected to:
    ├── Clerk (Production instance)
    └── Convex (Production deployment)
```

## Key Concepts

### 1. Server Components vs Client Components

```typescript
// ✅ Server Component (default)
// Can't use hooks, can't have interactivity
export default function Page() {
  return <div>Static content</div>
}

// ✅ Client Component (use "use client")
// Can use hooks, can be interactive
"use client"
export default function Page() {
  const { user } = useUser() // ✅ Works!
  return <div>Hello {user?.firstName}</div>
}
```

### 2. Queries vs Mutations

```typescript
// Query: Read data (real-time updates)
const bookings = useQuery(api.bookings.getUserBookings, { userId })

// Mutation: Write/update data
const createBooking = useMutation(api.bookings.createBooking)
await createBooking({ ... })
```

### 3. Protected Routes

```typescript
// Public: Anyone can access
("/", "/hotels", "/flights");

// Protected: Login required (middleware.ts)
("/profile", "/my-bookings", "/wishlist");
```

---

This architecture provides:

- ✅ **Scalability**: Convex handles real-time sync
- ✅ **Security**: Multi-layer authentication
- ✅ **Performance**: Edge-deployed, optimized
- ✅ **Developer Experience**: Type-safe, hot-reload
- ✅ **User Experience**: Real-time updates, fast auth
