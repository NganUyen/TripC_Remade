// ============================================================
// Dining Module - Central Export File
// ============================================================
// This is the central hub that connects all Dining module components
// Import from here to maintain loose coupling and modularity
// ============================================================

// Types
export * from "./types";

// Services
export { venueService, VenueService } from "./services/venueService";
export { menuService, MenuService } from "./services/menuService";
export {
  reservationService,
  ReservationService,
} from "./services/reservationService";
export { reviewService, ReviewService } from "./services/reviewService";
export { cartService, CartService } from "./services/cartService";

// Re-export for convenience
export type {
  DiningVenue,
  DiningMenu,
  DiningMenuItem,
  DiningTable,
  DiningReservation,
  DiningTimeSlot,
  DiningBlockedDate,
  CreateVenueRequest,
  CreateReservationRequest,
  VenueSearchParams,
  VenueListResponse,
} from "./types";

// Re-export review types
export type {
  DiningReview,
  CreateReviewRequest,
  ReviewStats,
} from "./services/reviewService";

// Re-export cart types
export type { CartItem, CreateCartItemRequest } from "./services/cartService";
