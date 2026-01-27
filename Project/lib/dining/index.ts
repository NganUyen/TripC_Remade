// ============================================================
// Dining Module - Central Export File
// ============================================================
// This is the central hub that connects all Dining module components
// Import from here to maintain loose coupling and modularity
// ============================================================

// Types
export * from './types'

// Services
export { venueService, VenueService } from './services/venueService'
export { menuService, MenuService } from './services/menuService'
export { reservationService, ReservationService } from './services/reservationService'

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
} from './types'
