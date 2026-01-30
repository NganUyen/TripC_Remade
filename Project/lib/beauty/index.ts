// ============================================================
// Beauty Module - Central Export File
// ============================================================
// Central hub for Beauty module. Import from here for loose coupling.
// ============================================================

export * from "./types";

export { venueService, VenueService } from "./services/venueService";
export { serviceService, ServiceService } from "./services/serviceService";
export {
  appointmentService,
  AppointmentService,
} from "./services/appointmentService";

export type {
  BeautyVenue,
  BeautyService,
  BeautyAppointment,
  CreateVenueRequest,
  CreateServiceRequest,
  CreateAppointmentRequest,
  VenueSearchParams,
  VenueListResponse,
} from "./types";
