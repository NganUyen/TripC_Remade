# Hotel Filter System Implementation

## Business Analysis & Implementation Document

**Date:** 2025
**Implemented by:** BA + Fullstack Developer
**Task:** Comprehensive hotel filter system with proper business logic

---

## 1. Business Requirements

### 1.1 Functional Requirements

- Users should be able to filter hotels by:
  - **Price Range**: Both minimum and maximum price
  - **Star Rating**: 3, 4, 5 stars (multi-select)
  - **Amenities**: Breakfast, Pool, Spa, WiFi, Beach Access (multi-select)
- Filters should persist in URL for shareability
- Real-time filter feedback showing:
  - Number of results found
  - Active filter count
  - Filter badges
- Empty state with clear call-to-action when no results

### 1.2 Non-Functional Requirements

- Fast response time (<2s for filter operations)
- Mobile-responsive filter UI
- Graceful error handling
- Clear user feedback during operations

---

## 2. System Architecture

### 2.1 Component Structure

```
┌─────────────────────────────────────┐
│      Hotels Page (/hotels)          │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ HotelFilters │  │ HotelList   │ │
│  │  (Sidebar)   │  │  (Results)  │ │
│  └──────┬───────┘  └──────┬──────┘ │
│         │                 │         │
│         └────URL Params───┘         │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ API: /hotels │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Supabase DB │
    └──────────────┘
```

### 2.2 Data Flow

1. User adjusts filter controls → HotelFilters component
2. Component updates URL search params
3. HotelList detects URL change (useEffect)
4. HotelList calls GET /api/hotels with filter params
5. API applies filters to database query
6. Results returned and displayed
7. Filter feedback shown (count, badges)

---

## 3. API Implementation

### 3.1 Endpoint: GET /api/hotels

**URL Parameters:**

```typescript
{
  city?: string           // City/destination filter
  minPrice?: string       // Minimum price in dollars (e.g., "100")
  maxPrice?: string       // Maximum price in dollars (e.g., "500")
  stars?: string          // Comma-separated ratings (e.g., "4,5")
  amenities?: string      // Comma-separated amenities (e.g., "pool,spa")
  limit?: string          // Results per page (default: 100)
  offset?: string         // Pagination offset (default: 0)
}
```

**Response:**

```typescript
{
  success: boolean
  data: Hotel[]
  pagination: {
    total: number
    limit: number
    offset: number
    returned: number
  }
  query: {
    city: string | null
    minPrice: string | null
    maxPrice: string | null
    stars: string | null
    amenities: string | null
  }
}
```

### 3.2 Filter Logic

#### 3.2.1 Price Range Filter

```typescript
// Convert dollars to cents for comparison
if (minPrice) {
  const price = parseFloat(minPrice);
  query = query.gte("best_price", Math.round(price * 100));
}

if (maxPrice) {
  const price = parseFloat(maxPrice);
  query = query.lte("best_price", Math.round(price * 100));
}
```

**Business Rules:**

- Database stores prices in cents (e.g., $120 = 12000 cents)
- User interface shows dollars
- Conversion happens at API boundary
- Minimum price: $50 (prevents $0 searches)
- Maximum price: $1000+ (open-ended for luxury hotels)

#### 3.2.2 Star Rating Filter

```typescript
if (stars) {
  const starArray = stars
    .split(",")
    .map((s) => parseInt(s))
    .filter((s) => !isNaN(s) && s >= 1 && s <= 5);

  if (starArray.length > 0) {
    query = query.in("star_rating", starArray);
  }
}
```

**Business Rules:**

- Multi-select: User can choose multiple star ratings
- OR logic: Show hotels with ANY of the selected ratings
- Validation: Only accept 1-5 star ratings
- Database field: `star_rating` (integer)

#### 3.2.3 Amenity Filter

```typescript
// Fetch data first, then filter in JavaScript
let filteredData = rawData || [];

if (amenities) {
  const amenityArray = amenities.split(",").filter((a) => a.trim());

  filteredData = filteredData.filter((hotel: any) => {
    if (!hotel.amenities || !Array.isArray(hotel.amenities)) {
      return false;
    }

    // Hotel must have ALL selected amenities
    return amenityArray.every((requestedAmenity) =>
      hotel.amenities.some(
        (hotelAmenity: string) =>
          hotelAmenity.toLowerCase().includes(requestedAmenity.toLowerCase()) ||
          requestedAmenity.toLowerCase().includes(hotelAmenity.toLowerCase()),
      ),
    );
  });
}
```

**Business Rules:**

- Multi-select: User can choose multiple amenities
- AND logic: Hotel must have ALL selected amenities
- Fuzzy matching: "pool" matches "Swimming Pool", "Infinity Pool"
- Database field: `amenities` (text array)
- Filtering in JavaScript for flexible matching

---

## 4. Frontend Implementation

### 4.1 HotelFilters Component

**State Management:**

```typescript
const [priceMin, setPriceMin] = useState(50);
const [priceMax, setPriceMax] = useState(1000);
const [selectedStars, setSelectedStars] = useState<number[]>([]);
const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
```

**URL Synchronization:**

```typescript
// Initialize from URL on mount
useEffect(() => {
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const stars = searchParams.get("stars");
  const amenities = searchParams.get("amenities");

  if (minPrice) setPriceMin(parseInt(minPrice));
  if (maxPrice) setPriceMax(parseInt(maxPrice));
  if (stars) setSelectedStars(stars.split(",").map(Number));
  if (amenities) setSelectedAmenities(amenities.split(","));
}, []);

// Update URL when filters change
const updateFilters = (updates: Record<string, string | null>) => {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  router.push(`/hotels?${params.toString()}`);
};
```

**UI Features:**

- **Active Filter Badge**: Shows count of active filters on "Filters" header
- **Reset Button**: Disabled when no filters active, clears all filters while preserving search context
- **Dual Price Sliders**: Separate min and max controls with validation (min < max)
- **Star Rating Checkboxes**: Visual stars with orange highlight when selected
- **Amenity Checkboxes**: Icon + label with check mark when selected

### 4.2 HotelList Component

**Filter Detection:**

```typescript
const activeFilterCount =
  (minPrice ? 1 : 0) +
  (maxPrice ? 1 : 0) +
  (stars ? stars.split(",").length : 0) +
  (amenities ? amenities.split(",").length : 0);
```

**Result Header:**

```typescript
{hotels.length} {hotels.length === 1 ? "Property" : "Properties"} Found
{destination && <span>in {destination}</span>}
{activeFilterCount > 0 && (
  <span>• {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied</span>
)}
```

**Empty State:**

```typescript
if (!loading && hotels.length === 0) {
  return (
    <div>
      <h3>No hotels found</h3>
      <p>
        {activeFilterCount > 0
          ? "Try adjusting your filters to see more results"
          : "Try adjusting your search criteria"}
      </p>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters}>Clear Filters</button>
      )}
    </div>
  );
}
```

---

## 5. User Experience Flows

### 5.1 Basic Filter Flow

```
1. User lands on hotels page
   → Shows all hotels in destination
   → Filter panel shows default values

2. User adjusts price slider
   → URL updates immediately
   → HotelList re-fetches with new params
   → Loading spinner shows briefly
   → Results update
   → Header shows "X Properties Found • 1 filter applied"

3. User selects star ratings
   → Checkboxes toggle visually
   → URL updates with "stars=4,5"
   → Results update
   → Header shows "• 2 filters applied"

4. User selects amenities
   → Multiple amenities can be selected
   → Results narrow down (AND logic)
   → Header updates filter count

5. User clicks "Reset"
   → All filters clear
   → Search params (destination, dates) preserved
   → Results return to initial state
```

### 5.2 Empty State Flow

```
1. User applies very restrictive filters
   → e.g., 5-star + pool + spa + beach + price $50-$100

2. No results match
   → Empty state card displays
   → Icon + message shown
   → "Clear Filters" button prominent

3. User clicks "Clear Filters"
   → All filters removed
   → Results reappear
   → User can start fresh
```

### 5.3 URL Sharing Flow

```
1. User applies filters
   → URL: /hotels?destination=Hanoi&minPrice=200&maxPrice=500&stars=4,5&amenities=pool,wifi

2. User copies URL
   → Shares with friend

3. Friend opens URL
   → All filters pre-applied
   → Same results shown
   → Filter UI shows active selections
```

---

## 6. Business Logic Rules

### 6.1 Price Range

- **Default Range**: $50 - $1000+
- **Minimum Step**: $50 increments
- **Validation**: minPrice < maxPrice (enforced)
- **Display**: "$1000+" for maximum to indicate open-ended

### 6.2 Star Rating

- **Options**: 5, 4, 3 stars
- **Selection**: Multi-select (OR logic)
- **Default**: None selected = show all ratings
- **Visual**: Orange stars when selected

### 6.3 Amenities

- **Available Options**:
  - Free Breakfast (`breakfast`)
  - Swimming Pool (`pool`)
  - Spa & Wellness (`spa`)
  - Free WiFi (`wifi`)
  - Beach Access (`beach`)
- **Selection**: Multi-select (AND logic)
- **Matching**: Fuzzy/partial match for flexibility
- **Default**: None selected = show all hotels

### 6.4 Filter Persistence

- **URL Storage**: All filters in query params
- **Page Refresh**: Filters persist
- **Navigation**: Back/forward button respects filters
- **Sharing**: URLs fully shareable with filters intact

---

## 7. Testing Scenarios

### 7.1 Functional Tests

**Test 1: Basic Price Filter**

```
Input: Set max price to $200
Expected: Only hotels ≤ $200 shown
Verify: Database query includes `best_price <= 20000`
```

**Test 2: Price Range Filter**

```
Input: Set min $100, max $300
Expected: Hotels between $100-$300 shown
Verify: API receives both params correctly
```

**Test 3: Star Rating Filter**

```
Input: Select 4 and 5 stars
Expected: Only 4 and 5-star hotels shown
Verify: URL has "stars=4,5"
```

**Test 4: Multiple Amenity Filter**

```
Input: Select Pool, WiFi, Spa
Expected: Hotels with ALL three amenities
Verify: Filter logic uses AND (every)
```

**Test 5: Combined Filters**

```
Input: $200-$500 + 5-star + Pool + Breakfast
Expected: Narrow results matching all criteria
Verify: All filters applied in API
```

**Test 6: Empty Results**

```
Input: Extreme filters (5-star, $50-$100, all amenities)
Expected: "No hotels found" message + Clear Filters button
Action: Click Clear Filters
Expected: Filters reset, results return
```

**Test 7: Filter Reset**

```
Setup: Apply multiple filters
Action: Click "Reset" button
Expected: All filters clear, search params remain
Verify: URL keeps destination/dates
```

**Test 8: URL Persistence**

```
Setup: Apply filters
Action: Copy URL, open in new tab
Expected: Same filters and results
Verify: All filter states restored from URL
```

### 7.2 Edge Cases

**Edge 1: Invalid URL Params**

```
Input: /hotels?minPrice=abc&stars=10,20
Expected: Invalid params ignored, default behavior
Verify: No errors, validation works
```

**Edge 2: Min > Max Price**

```
Action: Try to set min above max using dev tools
Expected: UI prevents this, sliders constrained
```

**Edge 3: Empty Amenity Array**

```
Database: Hotel with `amenities: []`
Filter: Select any amenity
Expected: Hotel excluded from results
```

**Edge 4: Null/Undefined Amenities**

```
Database: Hotel with `amenities: null`
Filter: Select any amenity
Expected: Hotel excluded safely (no crash)
```

---

## 8. Performance Considerations

### 8.1 Database Query Optimization

- **Indexed Fields**: Ensure `star_rating`, `best_price`, `address->city` have indexes
- **Query Order**: Apply most restrictive filters first
- **Pagination**: Limit results to 100 per query
- **Caching**: Consider Redis for popular filter combinations

### 8.2 Frontend Optimization

- **Debouncing**: Price slider changes debounced (future enhancement)
- **Lazy Loading**: Images lazy loaded
- **Memoization**: Filter computations memoized
- **Bundle Size**: Icons tree-shaken

---

## 9. Future Enhancements

### 9.1 Priority 1 (Next Sprint)

- [ ] Sort options (price: low→high, high→low, rating)
- [ ] Guest rating filter (6+, 7+, 8+, 9+)
- [ ] Property type filter (Hotel, Resort, Villa, Apartment)
- [ ] Distance from location filter

### 9.2 Priority 2 (Q2)

- [ ] Mobile filter drawer (slide-in panel)
- [ ] Date availability integration
- [ ] Filter presets ("Budget Friendly", "Luxury", "Family Friendly")
- [ ] Recently viewed filters

### 9.3 Priority 3 (Future)

- [ ] Map view with filter integration
- [ ] Save filter combinations
- [ ] Filter analytics tracking
- [ ] A/B testing framework
- [ ] AI-powered filter suggestions

---

## 10. Deployment Checklist

- [x] Database indexes created
- [x] API endpoint implemented and tested
- [x] Frontend components built
- [x] URL parameter handling working
- [x] Error handling implemented
- [x] Loading states added
- [x] Empty states designed
- [x] Mobile responsive tested
- [ ] Analytics events added
- [ ] Performance monitoring set up
- [ ] User acceptance testing completed
- [ ] Documentation updated

---

## 11. Monitoring & Maintenance

### 11.1 Key Metrics

- Filter usage rate (% of users who filter)
- Most common filter combinations
- Average time to find hotel after filtering
- Filter abandonment rate
- Empty result rate by filter type

### 11.2 Alerts

- API response time > 3s
- Error rate > 1%
- Empty result rate > 30%
- Database query timeout

---

## Contact & Support

- **Technical Lead**: [Your Name]
- **BA Owner**: [BA Name]
- **Support**: [Support Channel]
