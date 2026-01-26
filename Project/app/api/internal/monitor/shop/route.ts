import { NextResponse } from 'next/server';

interface EndpointCheck {
    method: string;
    path: string;
    description: string;
    ok: boolean;
    code: number;
    latencyMs: number;
    message?: string;
    category?: string;
    details?: any;
}

interface MonitorResponse {
    overall: 'OK' | 'DEGRADED' | 'DOWN';
    lastCheckAt: string;
    summary: {
        okCount: number;
        failCount: number;
        avgLatencyMs: number;
        byCategory: Record<string, { ok: number; fail: number }>;
    };
    items: EndpointCheck[];
}

interface EndpointConfig {
    method: string;
    path: string;
    description: string;
    category: string;
    requiresAuth?: boolean;
    body?: any;
    headers?: Record<string, string>;
    expectedStatus?: number;
    validateSchema?: (data: any) => { valid: boolean; errors?: string[] };
    dependsOn?: string; // For dynamic cart item ID
}

// Mock auth token (session ID generated per request in GET)
const TEST_AUTH_TOKEN = 'mock-test-token';

// Generate unique session ID per test run to avoid cart accumulation
function generateTestSessionId(): string {
    return 'monitor-test-session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// Captured IDs from sequential tests
let capturedCartItemId: string | null = null;
let capturedProductId: string = 'prod-001-uuid-mock';

const COMPREHENSIVE_TESTS: EndpointConfig[] = [
    // ========== HEALTH (2) ==========
    {
        method: 'GET',
        path: '/api/shop/health',
        description: 'Health check',
        category: 'Health',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = data.status && data.timestamp;
            return { valid, errors: valid ? undefined : ['Missing status/timestamp'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/health/ready',
        description: 'Readiness check',
        category: 'Health',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = typeof data.ready === 'boolean';
            return { valid, errors: valid ? undefined : ['Invalid ready field'] };
        },
    },

    // ========== PRODUCTS (6) ==========
    {
        method: 'GET',
        path: '/api/shop/products?limit=5',
        description: 'List products (paginated)',
        category: 'Products',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = Array.isArray(data.data) && data.meta?.total !== undefined;
            return { valid, errors: valid ? undefined : ['Invalid pagination'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/products?category=luggage&limit=3',
        description: 'Filter by category',
        category: 'Products',
        expectedStatus: 200,
    },
    {
        method: 'GET',
        path: '/api/shop/products?sort=price_asc&limit=3',
        description: 'Sort by price ascending',
        category: 'Products',
        expectedStatus: 200,
    },
    {
        method: 'GET',
        path: '/api/shop/products/samsonite-omni-pc-spinner-28',
        description: 'Product detail (valid)',
        category: 'Products',
        expectedStatus: 200,
        validateSchema: (data) => {
            const p = data.data;
            const valid = p?.id && p?.slug && Array.isArray(p?.variants);
            return { valid, errors: valid ? undefined : ['Missing fields'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/products/search?q=travel&limit=5',
        description: 'Search products',
        category: 'Products',
        expectedStatus: 200,
    },
    {
        method: 'GET',
        path: '/api/shop/categories',
        description: 'Categories tree',
        category: 'Products',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = Array.isArray(data.data);
            return { valid, errors: valid ? undefined : ['Not array'] };
        },
    },

    // ========== CART CRUD (7) ==========
    {
        method: 'GET',
        path: '/api/shop/cart',
        description: 'Get cart (empty)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        expectedStatus: 200,
        validateSchema: (data) => {
            const cart = data.data;
            const valid = cart?.id && Array.isArray(cart?.items);
            return { valid, errors: valid ? undefined : ['Invalid cart'] };
        },
    },
    {
        method: 'POST',
        path: '/api/shop/cart/items',
        description: 'Add item (luggage $299)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { variant_id: 'var-001-black-uuid', qty: 1 },
        expectedStatus: 201,
        validateSchema: (data) => {
            const cart = data.data;
            const valid = cart?.items?.length > 0;
            return { valid, errors: valid ? undefined : ['No items'] };
        },
    },
    {
        method: 'POST',
        path: '/api/shop/cart/items',
        description: 'Add another item (pillow $29)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { variant_id: 'var-002-gray-uuid', qty: 2 },
        expectedStatus: 201,
    },
    {
        method: 'POST',
        path: '/api/shop/cart/apply-coupon',
        description: 'Apply coupon (WELCOME10)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { code: 'WELCOME10' },
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = data.data?.coupon_code === 'WELCOME10';
            return { valid, errors: valid ? undefined : ['Coupon not applied'] };
        },
    },
    {
        method: 'PATCH',
        path: '/api/shop/cart/items/{item_id}',
        description: 'Update item qty (2 → 3)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { qty: 3 },
        expectedStatus: 200,
        dependsOn: 'cart_item_id',
    },
    {
        method: 'DELETE',
        path: '/api/shop/cart/items/{item_id}',
        description: 'Remove item from cart',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        expectedStatus: 200,
        dependsOn: 'cart_item_id',
    },
    {
        method: 'GET',
        path: '/api/shop/cart',
        description: 'Get cart (after changes)',
        category: 'Cart',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        expectedStatus: 200,
    },

    // ========== CHECKOUT (2) ==========
    {
        method: 'GET',
        path: '/api/shop/shipping-methods',
        description: 'List shipping methods',
        category: 'Checkout',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = Array.isArray(data.data) && data.data.length > 0;
            return { valid, errors: valid ? undefined : ['No methods'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/addresses',
        description: 'List addresses (unauth)',
        category: 'Checkout',
        expectedStatus: 401,
        validateSchema: (data) => {
            const valid = data.error?.code === 'UNAUTHORIZED';
            return { valid, errors: valid ? undefined : ['Should require auth'] };
        },
    },

    // ========== ORDERS (2) ==========
    {
        method: 'GET',
        path: '/api/shop/orders',
        description: 'List orders (unauth)',
        category: 'Orders',
        expectedStatus: 401,
    },
    {
        method: 'GET',
        path: '/api/shop/orders/fake-order-123',
        description: 'Get order detail (unauth)',
        category: 'Orders',
        expectedStatus: 401,
    },

    // ========== VOUCHERS (3) ==========
    {
        method: 'GET',
        path: '/api/shop/vouchers/available',
        description: 'List available vouchers',
        category: 'Vouchers',
        expectedStatus: 200,
        validateSchema: (data) => {
            const valid = Array.isArray(data.data);
            return { valid, errors: valid ? undefined : ['Not array'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/vouchers/my',
        description: 'My vouchers (unauth)',
        category: 'Vouchers',
        expectedStatus: 401,
    },
    {
        method: 'POST',
        path: '/api/shop/vouchers/redeem',
        description: 'Redeem voucher (unauth)',
        category: 'Vouchers',
        body: { template_id: 'vt-50off-uuid' },
        expectedStatus: 401,
    },

    // ========== WISHLIST (2) ==========
    {
        method: 'GET',
        path: '/api/shop/wishlist',
        description: 'Get wishlist (unauth)',
        category: 'Wishlist',
        expectedStatus: 401,
    },
    {
        method: 'POST',
        path: '/api/shop/wishlist',
        description: 'Add to wishlist (unauth)',
        category: 'Wishlist',
        body: { product_id: 'prod-001-uuid-mock' },
        expectedStatus: 401,
    },

    // ========== REVIEWS (1) ==========
    {
        method: 'POST',
        path: '/api/shop/reviews',
        description: 'Submit review (unauth)',
        category: 'Reviews',
        body: { product_id: 'prod-001-uuid-mock', rating: 5, title: 'Great!', body: 'Love it' },
        expectedStatus: 401,
    },

    // ========== ERROR CASES (6) ==========
    {
        method: 'GET',
        path: '/api/shop/products/non-existent-slug',
        description: 'Product not found (404)',
        category: 'Error Cases',
        expectedStatus: 404,
        validateSchema: (data) => {
            const valid = data.error?.code === 'PRODUCT_NOT_FOUND';
            return { valid, errors: valid ? undefined : ['Wrong error code'] };
        },
    },
    {
        method: 'GET',
        path: '/api/shop/products/search?q=x',
        description: 'Search too short (400)',
        category: 'Error Cases',
        expectedStatus: 400,
        validateSchema: (data) => {
            const valid = data.error?.code === 'INVALID_QUERY';
            return { valid, errors: valid ? undefined : ['Wrong error'] };
        },
    },
    {
        method: 'POST',
        path: '/api/shop/cart/items',
        description: 'Invalid variant (404)',
        category: 'Error Cases',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { variant_id: 'invalid-id', qty: 1 },
        expectedStatus: 404,
    },
    {
        method: 'POST',
        path: '/api/shop/cart/items',
        description: 'Missing qty (400)',
        category: 'Error Cases',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { variant_id: 'var-001-black-uuid' },
        expectedStatus: 400,
    },
    {
        method: 'POST',
        path: '/api/shop/cart/apply-coupon',
        description: 'Invalid coupon (400)',
        category: 'Error Cases',
        headers: { 'x-session-id': 'SESSION_ID_PLACEHOLDER' },
        body: { code: 'FAKE_COUPON' },
        expectedStatus: 400,
    },
    {
        method: 'GET',
        path: '/api/shop/cart',
        description: 'Cart no session (401)',
        category: 'Error Cases',
        expectedStatus: 401,
    },
];

async function checkEndpoint(
    baseUrl: string,
    config: EndpointConfig,
    context: { cartItemId?: string; sessionId: string }
): Promise<EndpointCheck> {
    const startTime = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Replace dynamic placeholders
        let path = config.path;
        if (config.dependsOn === 'cart_item_id' && context.cartItemId) {
            path = path.replace('{item_id}', context.cartItemId);
        }

        // Clone headers and replace session ID placeholder
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (config.headers) {
            for (const [key, value] of Object.entries(config.headers)) {
                // Replace placeholder with actual session ID
                headers[key] = value === 'SESSION_ID_PLACEHOLDER' ? context.sessionId : value;
            }
        }

        if (config.requiresAuth) {
            headers['Authorization'] = `Bearer ${TEST_AUTH_TOKEN}`;
        }

        const response = await fetch(`${baseUrl}${path}`, {
            method: config.method,
            signal: controller.signal,
            headers,
            body: config.body ? JSON.stringify(config.body) : undefined,
        });

        clearTimeout(timeoutId);
        const latencyMs = Math.round(performance.now() - startTime);

        let responseData: any;
        try {
            responseData = await response.json();
        } catch {
            responseData = null;
        }

        // Status match
        const statusMatch = config.expectedStatus
            ? response.status === config.expectedStatus
            : response.ok;

        // Schema validation
        let schemaValidation: { valid: boolean; errors?: string[] } | null = null;
        if (config.validateSchema && responseData) {
            schemaValidation = config.validateSchema(responseData);
        }

        const ok = statusMatch && (schemaValidation ? schemaValidation.valid : true);

        let message: string | undefined;
        if (!statusMatch) {
            message = `Expected ${config.expectedStatus || '2xx'}, got ${response.status}`;
        } else if (schemaValidation && !schemaValidation.valid) {
            message = `Schema: ${schemaValidation.errors?.join(', ')}`;
        }

        return {
            method: config.method,
            path: config.path,
            description: config.description,
            category: config.category,
            ok,
            code: response.status,
            latencyMs,
            message: ok ? undefined : message,
            details: !ok && responseData ? { response: responseData } : undefined,
        };
    } catch (error: any) {
        const latencyMs = Math.round(performance.now() - startTime);
        return {
            method: config.method,
            path: config.path,
            description: config.description,
            category: config.category,
            ok: false,
            code: 0,
            latencyMs,
            message: error.name === 'AbortError' ? 'Timeout (>5s)' : error.message,
        };
    }
}

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate fresh session ID per test run to avoid cart accumulation
    const sessionId = generateTestSessionId();

    const results: EndpointCheck[] = [];
    const context: { cartItemId?: string; sessionId: string } = { sessionId };

    // Run tests sequentially
    for (const config of COMPREHENSIVE_TESTS) {
        const result = await checkEndpoint(baseUrl, config, context);
        results.push(result);

        // Capture cart item ID after add
        if (
            config.method === 'POST' &&
            config.path === '/api/shop/cart/items' &&
            result.ok &&
            result.details === undefined
        ) {
            // Fetch cart to get item ID
            try {
                const cartRes = await fetch(`${baseUrl}/api/shop/cart`, {
                    headers: { 'x-session-id': sessionId },
                });
                const cartData = await cartRes.json();
                if (cartData.data?.items?.[0]?.id) {
                    context.cartItemId = cartData.data.items[0].id;
                }
            } catch { }
        }
    }

    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.length - okCount;
    const avgLatencyMs = Math.round(
        results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length
    );

    // Group by category
    const byCategory: Record<string, { ok: number; fail: number }> = {};
    for (const result of results) {
        const cat = result.category || 'Other';
        if (!byCategory[cat]) {
            byCategory[cat] = { ok: 0, fail: 0 };
        }
        if (result.ok) {
            byCategory[cat].ok++;
        } else {
            byCategory[cat].fail++;
        }
    }

    let overall: 'OK' | 'DEGRADED' | 'DOWN';
    if (failCount === 0) {
        overall = 'OK';
    } else if (failCount < results.length / 2) {
        overall = 'DEGRADED';
    } else {
        overall = 'DOWN';
    }

    const response: MonitorResponse = {
        overall,
        lastCheckAt: new Date().toISOString(),
        summary: {
            okCount,
            failCount,
            avgLatencyMs,
            byCategory,
        },
        items: results,
    };

    return NextResponse.json(response);
}
