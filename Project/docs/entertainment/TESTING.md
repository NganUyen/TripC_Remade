# Entertainment Service - Test Examples

This file contains example tests for the Entertainment Service API. These can be adapted for your preferred testing framework (Jest, Vitest, etc.).

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev @jest/globals @testing-library/react jest-environment-jsdom
# or
npm install --save-dev vitest @vitest/ui
```

### Test Configuration

For Jest, create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
};
```

For Vitest, add to `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

## Test Examples

### 1. Health Check Test

```typescript
// __tests__/api/ping.test.ts
import { describe, it, expect } from "@jest/globals";

describe("Health Check API", () => {
  it("should return health status", async () => {
    const response = await fetch("http://localhost:3000/api/ping");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.services).toBeDefined();
    expect(data.services.entertainment_db).toBeDefined();
  });

  it("should check entertainment database connectivity", async () => {
    const response = await fetch("http://localhost:3000/api/ping");
    const data = await response.json();

    expect(data.services.entertainment_db).toBe("ok");
    expect(data.performance.entertainment_db_response_time_ms).toBeGreaterThan(
      0,
    );
  });
});
```

### 2. List Entertainment Items Test

```typescript
// __tests__/api/entertainment-list.test.ts
import { describe, it, expect } from "@jest/globals";

describe("GET /api/entertainment", () => {
  it("should return a list of entertainment items", async () => {
    const response = await fetch("http://localhost:3000/api/entertainment");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.pagination).toBeDefined();
  });

  it("should filter by type", async () => {
    const response = await fetch(
      "http://localhost:3000/api/entertainment?type=tour",
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    data.data.forEach((item: any) => {
      expect(item.type).toBe("tour");
    });
  });

  it("should search by query string", async () => {
    const response = await fetch(
      "http://localhost:3000/api/entertainment?q=Paris",
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);

    // At least one result should contain "Paris"
    const hasParisInResults = data.data.some(
      (item: any) =>
        item.title.includes("Paris") ||
        item.subtitle?.includes("Paris") ||
        item.description?.includes("Paris"),
    );
    expect(hasParisInResults).toBe(true);
  });

  it("should support pagination", async () => {
    const response = await fetch(
      "http://localhost:3000/api/entertainment?limit=2&offset=0",
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.limit).toBe(2);
    expect(data.pagination.offset).toBe(0);
    expect(data.data.length).toBeLessThanOrEqual(2);
  });
});
```

### 3. Get Single Item Test

```typescript
// __tests__/api/entertainment-single.test.ts
import { describe, it, expect, beforeAll } from "@jest/globals";

describe("GET /api/entertainment/:id", () => {
  let testItemId: string;

  beforeAll(async () => {
    // Get an item ID from the list
    const response = await fetch(
      "http://localhost:3000/api/entertainment?limit=1",
    );
    const data = await response.json();
    testItemId = data.data[0]?.id;
  });

  it("should return a single entertainment item", async () => {
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${testItemId}`,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe(testItemId);
    expect(data.data.title).toBeDefined();
    expect(data.data.type).toBeDefined();
  });

  it("should return 404 for non-existent item", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${fakeId}`,
    );

    expect(response.status).toBe(404);
  });

  it("should validate UUID format", async () => {
    const invalidId = "not-a-uuid";
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${invalidId}`,
    );

    // Should return 404 or 500 for invalid UUID
    expect([404, 500]).toContain(response.status);
  });
});
```

### 4. Create Item Test (with Auth Mock)

```typescript
// __tests__/api/entertainment-create.test.ts
import { describe, it, expect } from "@jest/globals";

describe("POST /api/entertainment", () => {
  const mockAuthToken = "mock-clerk-token"; // Replace with real token for integration tests

  it("should require authentication", async () => {
    const response = await fetch("http://localhost:3000/api/entertainment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Entertainment",
        type: "tour",
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should validate required fields", async () => {
    const response = await fetch("http://localhost:3000/api/entertainment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockAuthToken}`,
      },
      body: JSON.stringify({
        subtitle: "Missing title and type",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toContain("required");
  });

  // Note: This test requires a valid Clerk token
  it.skip("should create a new entertainment item", async () => {
    const newItem = {
      title: "Test Tour",
      subtitle: "A test tour item",
      type: "tour",
      price: 50.0,
      currency: "USD",
      location: {
        city: "Test City",
        country: "Test Country",
      },
    };

    const response = await fetch("http://localhost:3000/api/entertainment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockAuthToken}`,
      },
      body: JSON.stringify(newItem),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.data.id).toBeDefined();
    expect(data.data.title).toBe(newItem.title);
    expect(data.data.type).toBe(newItem.type);
  });
});
```

### 5. Update Item Test

```typescript
// __tests__/api/entertainment-update.test.ts
import { describe, it, expect, beforeAll } from "@jest/globals";

describe("PUT /api/entertainment/:id", () => {
  const mockAuthToken = "mock-clerk-token"; // Replace with real token
  let testItemId: string;

  beforeAll(async () => {
    const response = await fetch(
      "http://localhost:3000/api/entertainment?limit=1",
    );
    const data = await response.json();
    testItemId = data.data[0]?.id;
  });

  it("should require authentication", async () => {
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${testItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: 100.0,
        }),
      },
    );

    expect(response.status).toBe(401);
  });

  // Note: This test requires a valid Clerk token
  it.skip("should update an entertainment item", async () => {
    const updates = {
      price: 99.99,
      available: false,
    };

    const response = await fetch(
      `http://localhost:3000/api/entertainment/${testItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify(updates),
      },
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data.price).toBe(updates.price);
    expect(data.data.available).toBe(updates.available);
  });

  it("should return 404 for non-existent item", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${fakeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({ price: 100.0 }),
      },
    );

    expect([401, 404]).toContain(response.status);
  });
});
```

### 6. Delete Item Test

```typescript
// __tests__/api/entertainment-delete.test.ts
import { describe, it, expect } from "@jest/globals";

describe("DELETE /api/entertainment/:id", () => {
  const mockAuthToken = "mock-clerk-token"; // Replace with real token

  it("should require authentication", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await fetch(
      `http://localhost:3000/api/entertainment/${fakeId}`,
      {
        method: "DELETE",
      },
    );

    expect(response.status).toBe(401);
  });

  // Note: This test requires a valid Clerk token and will delete data
  it.skip("should delete an entertainment item", async () => {
    // First create an item to delete
    const createResponse = await fetch(
      "http://localhost:3000/api/entertainment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          title: "Item to Delete",
          type: "tour",
        }),
      },
    );

    const createData = await createResponse.json();
    const itemId = createData.data.id;

    // Now delete it
    const deleteResponse = await fetch(
      `http://localhost:3000/api/entertainment/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${mockAuthToken}`,
        },
      },
    );

    expect(deleteResponse.status).toBe(200);

    // Verify it's deleted
    const getResponse = await fetch(
      `http://localhost:3000/api/entertainment/${itemId}`,
    );
    expect(getResponse.status).toBe(404);
  });
});
```

## Running Tests

### With Jest

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test entertainment-list.test.ts

# Run with coverage
npm test -- --coverage
```

### With Vitest

```bash
# Run all tests
npx vitest

# Run in UI mode
npx vitest --ui

# Run specific test file
npx vitest entertainment-list.test.ts

# Run with coverage
npx vitest --coverage
```

## Integration Testing Tips

### 1. Use Test Database

Create a separate Supabase project for testing:

```bash
# .env.test.local
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
```

### 2. Mock Authentication

For unit tests, mock Clerk auth:

```typescript
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => Promise.resolve({ userId: "mock-user-id" })),
}));
```

### 3. Setup/Teardown

```typescript
beforeEach(async () => {
  // Insert test data
});

afterEach(async () => {
  // Clean up test data
});
```

### 4. Use Test Fixtures

```typescript
// __tests__/fixtures/entertainment.ts
export const mockEntertainmentItem = {
  title: "Test Tour",
  type: "tour",
  price: 50.0,
  currency: "USD",
};
```

## Manual Testing Checklist

- [ ] Health check returns entertainment_db: "ok"
- [ ] List all items works
- [ ] Search by query works
- [ ] Filter by type works
- [ ] Pagination works
- [ ] Get single item works
- [ ] Get non-existent item returns 404
- [ ] Create item without auth returns 401
- [ ] Create item with auth works
- [ ] Update item without auth returns 401
- [ ] Update item with auth works
- [ ] Delete item without auth returns 401
- [ ] Delete item with auth works

## Next Steps

1. Set up CI/CD pipeline to run tests automatically
2. Add E2E tests with Playwright or Cypress
3. Add load testing with k6 or Artillery
4. Set up test coverage reporting
5. Add mutation testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Supabase Testing](https://supabase.com/docs/guides/testing)
