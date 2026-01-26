/**
 * Shop Module Exports
 * 
 * Central export point for shop module utilities and types.
 * Use this for clean imports across the application.
 * 
 * @example
 * ```ts
 * import { Product, successResponse, getProducts } from '@/lib/shop';
 * ```
 */

// Types
export type {
    Money,
    Product,
    Variant,
    VariantOption,
    Category,
    Brand,
    ProductImage,
    ShippingMethod,
    Coupon,
    VoucherTemplate,
    CartItem,
    Cart,
    Order,
    Address,
    UserVoucher,
    Review,
    ShopMockData,
} from './types';

// Utilities (response helpers, auth, etc.)
export {
    generateRequestId,
    money,
    successResponse,
    paginatedResponse,
    errorResponse,
    getAuthInfo,
} from './utils';

// Database Queries (interface layer - mock now, Supabase later)
export {
    // Products
    getProducts,
    getProductBySlug,
    getProductById,
    searchProducts,
    getVariantsByProductId,
    getVariantById,
    getProductImages,

    // Categories & Brands
    getCategories,
    getCategoryTree,
    getBrands,

    // Cart
    getCart,
    getOrCreateCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    applyCouponToCart,

    // Shipping
    getShippingMethods,

    // Addresses
    getUserAddresses,

    // Orders
    createOrder,
    getOrders,
    getOrderByNumber,
    cancelOrder,

    // Vouchers
    getAvailableVouchers,
    getUserVouchers,
    redeemVoucher,

    // Wishlist
    getWishlist,
    addToWishlist,
    removeFromWishlist,

    // Reviews
    createReview,
} from './queries';
