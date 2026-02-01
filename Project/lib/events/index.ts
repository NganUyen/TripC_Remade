// Events module barrel export
// Re-exports all types, functions, and utilities from the events module

// Types
export * from './types';

// Validation schemas
export * from './validation';

// Data access (server-side)
export * from './data-access';

// Client API
export { eventsApi, default as eventsApiDefault } from './api';
