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

// Supabase Client
export {
  supabaseServerClient,
  testDatabaseConnection,
} from "./supabaseServerClient";

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
  ReviewSummary,
  ShopMockData,
} from "./types";

// Utilities (response helpers, auth, etc.)
export {
  generateRequestId,
  money,
  successResponse,
  paginatedResponse,
  errorResponse,
} from "./utils";

export { getDbUserId } from "./queries";

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
  getOrderHistory,

  // Vouchers
  getAvailableVouchers,
  getUserVouchers,
  redeemVoucher,

  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,

  // Reviews
  getReviewsByProductId,
  getReviews,
  getReviewsSummary,
  createReview,

  // Addresses
  createAddress,
} from "./queries";

// Partner Queries
export {
  // Auth Helpers
  PartnerError,
  getPartnerMembership,
  requirePartnerAccess,

  // Profile
  applyAsPartner,
  getPartnerBySlug,
  updatePartnerProfile,

  // Products
  getPartnerProducts,
  getPartnerProductById,
  createPartnerProduct,
  updatePartnerProduct,
  publishPartnerProduct,
  archivePartnerProduct,
  deletePartnerProduct,

  // Variants
  createVariant,
  updateVariant,
  deleteVariant,

  // Images
  addProductImage,
  deleteProductImage,
  reorderProductImages,

  // Orders
  getPartnerOrders,
  getPartnerOrderById,

  // Analytics
  getPartnerDashboardStats,
  getPartnerTopProducts,

  // Team
  getPartnerTeam,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,

  // Admin
  adminGetPartners,
  adminReviewPartner,
} from "./partner-queries";

// Partner Types
export type {
  ShopPartner,
  PartnerMember,
  PartnerWithMembership,
  PartnerProduct,
  PartnerOrder,
  PartnerOrderItem,
  DashboardStats,
  PartnerApplicationData,
  PartnerStatus,
  PartnerBusinessType,
  PartnerMemberRole,
  PartnerMemberStatus,
  PartnerMemberPermissions,
} from "./types";

