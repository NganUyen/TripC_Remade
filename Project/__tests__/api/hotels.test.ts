/**
 * Hotel Service API Tests - Example Test Suite
 *
 * This file contains example tests for the Hotel Service API.
 * These tests require Jest to be properly configured.
 *
 * Prerequisites:
 * 1. Install Jest and types:
 *    npm install --save-dev jest @types/jest ts-jest
 *
 * 2. Configure Jest (create jest.config.js):
 *    module.exports = {
 *      preset: 'ts-jest',
 *      testEnvironment: 'node',
 *    };
 *
 * 3. Add to package.json scripts:
 *    "test": "jest",
 *    "test:watch": "jest --watch"
 *
 * Run with: npm test
 */

/**
 * TEST EXAMPLES (Uncomment when Jest is configured)
 *
 * These are example test cases that can be used once Jest is set up.
 * Copy this structure into your test files.
 */

export const hotelTestExamples = {
  description: "Hotel Service API Test Examples",

  setup: `
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let testHotelSlug = 'luxury-bangkok-hotel';
    let testRoomId: string;
  `,

  tests: {
    listHotels: {
      title: "should return list of hotels",
      code: `
        const res = await fetch(\`\${API_BASE}/api/hotels\`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
      `,
    },

    filterByCity: {
      title: "should filter hotels by city",
      code: `
        const res = await fetch(\`\${API_BASE}/api/hotels?city=Bangkok\`);
        const data = await res.json();
        data.data.forEach(hotel => {
          expect(hotel.city).toBe('Bangkok');
        });
      `,
    },

    hotelDetails: {
      title: "should return hotel details with rooms",
      code: `
        const res = await fetch(\`\${API_BASE}/api/hotels/\${testHotelSlug}\`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.data.slug).toBe(testHotelSlug);
        expect(Array.isArray(data.data.rooms)).toBe(true);
      `,
    },

    getRates: {
      title: "should return rates for valid date range",
      code: `
        const res = await fetch(
          \`\${API_BASE}/api/hotels/\${testHotelSlug}/rates?start=2025-02-01&end=2025-02-05\`
        );
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.data.summary.date_range.start).toBe('2025-02-01');
      `,
    },

    requiresAuth: {
      title: "booking should require authentication",
      code: `
        const res = await fetch(\`\${API_BASE}/api/hotels/bookings\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotel_id: 'test' }),
        });
        expect(res.status).toBe(401);
      `,
    },
  },
};

/**
 * MANUAL TESTING GUIDE
 *
 * Until Jest is configured, use these curl commands for testing:
 */

export const manualTestingGuide = {
  listHotels: "curl http://localhost:3000/api/hotels",

  filterByCity: 'curl "http://localhost:3000/api/hotels?city=Bangkok"',

  hotelDetails: "curl http://localhost:3000/api/hotels/luxury-bangkok-hotel",

  getRooms: "curl http://localhost:3000/api/hotels/luxury-bangkok-hotel/rooms",

  getRates:
    'curl "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05"',

  healthCheck: "curl http://localhost:3000/api/ping",

  createBooking: `curl -X POST http://localhost:3000/api/hotels/bookings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \\
  -d '{
    "hotel_id": "hotel-uuid",
    "room_id": "room-uuid",
    "check_in_date": "2025-03-01",
    "check_out_date": "2025-03-05",
    "guest_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }'`,
};

/**
 * BROWSER TESTING
 *
 * Visual testing in the browser:
 */

export const browserTesting = {
  healthMonitor: "http://localhost:3000/ping",

  apiExamples: [
    "http://localhost:3000/api/hotels",
    "http://localhost:3000/api/hotels?city=Bangkok",
    "http://localhost:3000/api/hotels/luxury-bangkok-hotel",
    "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rooms",
    "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05",
  ],
};

/**
 * EXPECTED RESPONSES
 */

export const expectedResponses = {
  listHotels: {
    success: true,
    data: [
      {
        id: "uuid",
        slug: "luxury-bangkok-hotel",
        title: "Luxury Bangkok Hotel",
        city: "Bangkok",
        rating: 4.8,
        // ... more fields
      },
    ],
    pagination: {
      total: 3,
      limit: 20,
      offset: 0,
      has_more: false,
    },
  },

  hotelDetails: {
    success: true,
    data: {
      slug: "luxury-bangkok-hotel",
      title: "Luxury Bangkok Hotel",
      rooms: [
        {
          id: "room-uuid",
          code: "DELUXE_KING",
          title: "Deluxe King Room",
          capacity: 2,
          // ... more fields
        },
      ],
      reviews: {
        items: [],
        count: 0,
        average_rating: null,
      },
    },
  },

  rates: {
    success: true,
    data: {
      rates: [
        {
          id: "rate-uuid",
          room_id: "room-uuid",
          date: "2025-02-01",
          price_cents: 15000,
          available_rooms: 5,
        },
      ],
      summary: {
        total_rooms_available: 3,
        date_range: { start: "2025-02-01", end: "2025-02-05" },
        lowest_rate: 12000,
        highest_rate: 35000,
      },
    },
  },
};

// Export to make this a valid TypeScript module
export default {
  hotelTestExamples,
  manualTestingGuide,
  browserTesting,
  expectedResponses,
};
