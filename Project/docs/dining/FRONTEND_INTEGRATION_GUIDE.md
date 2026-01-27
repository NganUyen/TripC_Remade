# Dining Service - Frontend Integration Guide

## Quick Start

This guide helps frontend developers integrate the dining service API into the TripC platform.

## Base URL

```
/api/dining
```

## Authentication

Currently using header-based auth (will migrate to Clerk JWT):

```javascript
headers: {
  'x-user-id': userId
}
```

---

## Common User Flows

### 1. Main Page - Restaurant Discovery

```typescript
// Fetch restaurants with filters
const searchRestaurants = async (filters: {
  city?: string;
  cuisine_type?: string;
  price_range?: string;
  min_rating?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/api/dining/venues?${params}`);
  const data = await response.json();

  return {
    venues: data.data.venues,
    total: data.data.total,
    hasMore: data.data.total > (filters.offset || 0) + data.data.venues.length,
  };
};

// Get featured restaurants
const getFeaturedVenues = async () => {
  const response = await fetch("/api/dining/venues/featured");
  const data = await response.json();
  return data.data;
};
```

**UI Components Needed:**

- Search bar with filters (city, cuisine, price, rating)
- Restaurant grid/list with cards
- Pagination controls
- Filter sidebar
- "No results" state

---

### 2. Restaurant Detail Page

```typescript
// Get restaurant details
const getVenueDetails = async (venueId: string) => {
  const response = await fetch(`/api/dining/venues/${venueId}`);
  const data = await response.json();
  return data.data;
};

// Get menu
const getVenueMenu = async (venueId: string) => {
  const response = await fetch(`/api/dining/menus?venue_id=${venueId}`);
  const data = await response.json();
  return data.data;
};

// Get reviews with stats
const getVenueReviews = async (venueId: string, limit = 10, offset = 0) => {
  const response = await fetch(
    `/api/dining/venues/${venueId}/reviews?limit=${limit}&offset=${offset}`,
  );
  const data = await response.json();
  return {
    reviews: data.data.reviews,
    stats: data.data.stats,
  };
};

// Check availability
const checkAvailability = async (
  venueId: string,
  date: string,
  time: string,
  guestCount: number,
) => {
  const params = new URLSearchParams({
    date,
    time,
    guest_count: guestCount.toString(),
  });
  const response = await fetch(
    `/api/dining/venues/${venueId}/availability?${params}`,
  );
  const data = await response.json();
  return data.data;
};

// Get available time slots
const getTimeSlots = async (venueId: string, date: string) => {
  const response = await fetch(
    `/api/dining/venues/${venueId}/timeslots?date=${date}`,
  );
  const data = await response.json();
  return data.data.time_slots;
};
```

**UI Components Needed:**

- Venue header (images, name, rating, address)
- Photo gallery
- Menu tabs (breakfast, lunch, dinner)
- Menu items with prices
- Reviews section with rating breakdown
- Review cards (rating, photos, helpful button)
- Booking form (date, time, guests, special requests)
- Availability indicator
- "Add to Cart" button
- "Book Now" button
- Wishlist button

---

### 3. Reviews Flow

```typescript
// Submit a review
const submitReview = async (
  venueId: string,
  userId: string,
  review: {
    rating: number; // 1-5
    title: string;
    comment: string;
    food_rating?: number;
    service_rating?: number;
    ambiance_rating?: number;
    value_rating?: number;
    photos?: string[];
    visit_date?: string;
  },
) => {
  const response = await fetch(`/api/dining/venues/${venueId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ venue_id: venueId, ...review }),
  });
  const data = await response.json();
  return data.data;
};

// Mark review as helpful
const markReviewHelpful = async (reviewId: string, userId: string) => {
  const response = await fetch(`/api/dining/reviews/${reviewId}/helpful`, {
    method: "PUT",
    headers: {
      "x-user-id": userId,
    },
  });
  return response.json();
};
```

**UI Components Needed:**

- Review form modal
  - 5-star rating selector
  - Detailed ratings (optional)
  - Title input
  - Comment textarea
  - Photo upload
  - Visit date picker
- Review card
  - Star rating display
  - User info
  - Review text
  - Photos
  - "Helpful" button with count
  - Venue response (if any)
- Review statistics
  - Average rating (large)
  - Rating distribution chart
  - Total review count

---

### 4. Cart Flow

```typescript
// Add to cart
const addToCart = async (
  userId: string,
  booking: {
    venue_id: string;
    reservation_date: string; // YYYY-MM-DD
    reservation_time: string; // HH:MM
    guest_count: number;
    special_requests?: string;
    occasion?: string;
    dietary_restrictions?: string[];
    duration_minutes?: number;
  },
) => {
  const response = await fetch("/api/dining/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(booking),
  });
  return response.json();
};

// Get cart
const getCart = async (userId: string) => {
  const response = await fetch("/api/dining/cart", {
    headers: {
      "x-user-id": userId,
    },
  });
  const data = await response.json();
  return {
    items: data.data.items,
    count: data.data.count,
  };
};

// Update cart item
const updateCartItem = async (
  cartItemId: string,
  userId: string,
  updates: {
    reservation_date?: string;
    reservation_time?: string;
    guest_count?: number;
    special_requests?: string;
  },
) => {
  const response = await fetch(`/api/dining/cart/${cartItemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(updates),
  });
  return response.json();
};

// Remove from cart
const removeFromCart = async (cartItemId: string, userId: string) => {
  const response = await fetch(`/api/dining/cart/${cartItemId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId,
    },
  });
  return response.json();
};

// Checkout cart
const checkoutCart = async (
  userId: string,
  guestInfo: {
    guest_name: string;
    guest_phone: string;
    guest_email: string;
  },
) => {
  const response = await fetch("/api/dining/cart/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(guestInfo),
  });
  const data = await response.json();
  return {
    reservations: data.data.reservations,
    errors: data.data.errors,
  };
};
```

**UI Components Needed:**

- Cart icon with badge (item count)
- Cart dropdown/sidebar
  - List of cart items
  - Venue name and details
  - Date, time, guest count
  - Remove button per item
  - Edit button per item
- Checkout page
  - Guest information form
  - Cart summary
  - Total (if applicable)
  - "Complete Booking" button
- Confirmation page
  - Reservation codes
  - Email/SMS confirmation message
  - "View My Reservations" link

---

### 5. Direct Booking (Skip Cart)

```typescript
// Create reservation directly
const createReservation = async (
  userId: string,
  reservation: {
    venue_id: string;
    reservation_date: string;
    reservation_time: string;
    guest_count: number;
    guest_name: string;
    guest_phone: string;
    guest_email: string;
    special_requests?: string;
    occasion?: string;
    dietary_restrictions?: string[];
    duration_minutes?: number;
  },
) => {
  const response = await fetch("/api/dining/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(reservation),
  });
  const data = await response.json();
  return data.data; // Returns reservation with code
};
```

---

### 6. My Reservations

```typescript
// Get user's reservations
const getMyReservations = async (userId: string, limit = 50) => {
  const response = await fetch(`/api/dining/reservations?limit=${limit}`, {
    headers: {
      "x-user-id": userId,
    },
  });
  const data = await response.json();
  return data.data;
};

// Get single reservation
const getReservation = async (reservationId: string, userId: string) => {
  const response = await fetch(`/api/dining/reservations/${reservationId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
  const data = await response.json();
  return data.data;
};

// Cancel reservation
const cancelReservation = async (reservationId: string, userId: string) => {
  const response = await fetch(`/api/dining/reservations/${reservationId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId,
    },
  });
  return response.json();
};
```

**UI Components Needed:**

- Reservation list
  - Upcoming vs Past tabs
  - Reservation cards (venue, date, time, guests, code)
  - Status badge (pending/confirmed/cancelled)
  - "Cancel" button for upcoming
  - "Write Review" button for past
- Reservation detail page
  - Full reservation info
  - QR code with reservation code
  - Venue contact info
  - Directions
  - "Cancel" button

---

### 7. Wishlist

```typescript
// Get wishlist
const getWishlist = async (userId: string) => {
  const response = await fetch("/api/dining/wishlist", {
    headers: {
      "x-user-id": userId,
    },
  });
  const data = await response.json();
  return data.data;
};

// Add to wishlist
const addToWishlist = async (
  userId: string,
  venueId: string,
  notes?: string,
) => {
  const response = await fetch("/api/dining/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ venue_id: venueId, notes }),
  });
  return response.json();
};

// Remove from wishlist
const removeFromWishlist = async (wishlistId: string, userId: string) => {
  const response = await fetch(`/api/dining/wishlist/${wishlistId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId,
    },
  });
  return response.json();
};

// Check if venue is in wishlist
const isInWishlist = (wishlist: any[], venueId: string) => {
  return wishlist.some((item) => item.venue_id === venueId);
};
```

**UI Components Needed:**

- Heart/bookmark icon on venue cards
- Wishlist page
  - Grid of saved venues
  - Remove button
  - "Book Now" button

---

## Component State Management Examples

### Restaurant List Page State

```typescript
interface RestaurantListState {
  venues: Venue[];
  loading: boolean;
  filters: {
    city: string;
    cuisine_type: string;
    price_range: string;
    min_rating: number;
    search: string;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}
```

### Restaurant Detail Page State

```typescript
interface RestaurantDetailState {
  venue: Venue | null;
  menus: Menu[];
  reviews: {
    items: Review[];
    stats: ReviewStats;
  };
  availability: AvailabilityInfo | null;
  timeSlots: TimeSlot[];
  loading: {
    venue: boolean;
    menus: boolean;
    reviews: boolean;
    availability: boolean;
  };
}
```

### Cart State

```typescript
interface CartState {
  items: CartItem[];
  count: number;
  loading: boolean;
  checkoutLoading: boolean;
}
```

---

## Error Handling

All API responses follow this structure:

```typescript
// Success
{
  success: true,
  data: {...}
}

// Error
{
  success: false,
  error: "Error message"
}
```

Example error handling:

```typescript
const handleApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    const response = await apiFunction();

    if (!response.success) {
      // Show error toast/message
      showError(response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    // Network or unexpected error
    showError("An unexpected error occurred");
    console.error(error);
    return null;
  }
};
```

---

## TypeScript Types

```typescript
interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string[];
  price_range: "budget" | "moderate" | "upscale" | "fine_dining";
  address: string;
  city: string;
  district: string;
  phone_number: string;
  email: string;
  website: string;
  images: string[];
  videos?: string[];
  latitude?: number;
  longitude?: number;
  capacity: number;
  average_rating: number;
  review_count: number;
  opening_hours: Record<string, { open: string; close: string }>;
  special_features: string[];
  ambiance: string[];
  dietary_options: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  outdoor_seating: boolean;
  accepts_reservations: boolean;
  accepts_walk_ins: boolean;
  is_active: boolean;
  is_featured: boolean;
}

interface Review {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  value_rating?: number;
  photos?: string[];
  visit_date?: string;
  helpful_count: number;
  venue_response?: string;
  venue_response_date?: string;
  created_at: string;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  food_avg: number;
  service_avg: number;
  ambiance_avg: number;
  value_avg: number;
}

interface CartItem {
  id: string;
  user_id: string;
  venue_id: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_requests?: string;
  occasion?: string;
  dietary_restrictions?: string[];
  duration_minutes?: number;
  venue_name: string;
  venue_image?: string;
  venue_address: string;
  created_at: string;
}

interface Reservation {
  id: string;
  user_id: string;
  venue_id: string;
  reservation_code: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  special_requests?: string;
  occasion?: string;
  dietary_restrictions?: string[];
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  duration_minutes?: number;
  table_number?: string;
  created_at: string;
  updated_at: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_guests_per_slot: number;
  current_reservations: number;
  current_guests: number;
  available_capacity: number;
  is_fully_booked: boolean;
}

interface AvailabilityInfo {
  available: boolean;
  capacity: number;
  available_capacity: number;
  current_reservations: number;
  time_slots: TimeSlot[];
  reason?: string;
}
```

---

## Best Practices

### 1. Loading States

Always show loading indicators while fetching data:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api();
    setData(data);
  } finally {
    setLoading(false);
  }
};
```

### 2. Optimistic Updates

For cart operations, update UI immediately:

```typescript
const handleAddToCart = async (item) => {
  // Update UI immediately
  setCartCount((prev) => prev + 1);

  try {
    await addToCart(item);
  } catch (error) {
    // Revert on error
    setCartCount((prev) => prev - 1);
    showError("Failed to add to cart");
  }
};
```

### 3. Debounce Search

Debounce search input to avoid too many API calls:

```typescript
import { useDebouncedCallback } from "use-debounce";

const handleSearch = useDebouncedCallback((query) => {
  searchRestaurants({ search: query });
}, 500);
```

### 4. Cache Data

Use React Query or SWR for automatic caching:

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["venue", venueId],
  queryFn: () => getVenueDetails(venueId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## Testing Checklist

- [ ] Search with different filters works
- [ ] Pagination loads more results
- [ ] Venue detail page shows all information
- [ ] Menu items display correctly
- [ ] Reviews load with statistics
- [ ] Availability check works
- [ ] Time slots display available capacity
- [ ] Add to cart creates cart item
- [ ] Cart shows all items
- [ ] Update cart item works
- [ ] Remove from cart works
- [ ] Checkout creates reservations
- [ ] Confirmation shows reservation codes
- [ ] My reservations lists all bookings
- [ ] Cancel reservation works
- [ ] Submit review creates review
- [ ] Mark review helpful increments count
- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Direct booking (skip cart) works
- [ ] Error states display properly
- [ ] Loading states show

---

## Support

For questions or issues:

- Check `/docs/dining/API_DOCUMENTATION.md` for detailed API reference
- Check `/docs/dining/IMPLEMENTATION_SUMMARY.md` for architecture overview
- Test endpoints using `/ping` page
- Contact backend team for API issues
