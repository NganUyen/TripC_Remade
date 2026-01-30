/**
 * Entertainment Service - TypeScript Types
 * 
 * Type definitions for entertainment items and API responses
 */

// Main entertainment item type matching database schema
export interface EntertainmentItem {
  id: string; // UUID
  title: string;
  subtitle: string | null;
  description: string | null;
  type: EntertainmentType;
  provider: string | null;
  price: number | null;
  currency: string;
  available: boolean;
  location: EntertainmentLocation | null;
  metadata: EntertainmentMetadata;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Entertainment types
export type EntertainmentType = 
  | 'tour' 
  | 'show' 
  | 'activity' 
  | 'attraction' 
  | 'concert'
  | 'sport'
  | string; // Allow custom types

// Location structure
export interface EntertainmentLocation {
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  address?: string;
  [key: string]: any; // Allow additional fields
}

// Metadata structure
export interface EntertainmentMetadata {
  images?: string[];
  duration?: string;
  capacity?: number;
  rating?: number;
  tags?: string[];
  min_age?: number;
  max_group_size?: number;
  includes?: string[];
  excludes?: string[];
  languages?: string[];
  difficulty_level?: 'easy' | 'moderate' | 'challenging' | 'expert';
  cancellation_policy?: string;
  meeting_point?: string;
  [key: string]: any; // Allow additional custom fields
}

// Create/Update request body (partial)
export interface CreateEntertainmentItemRequest {
  title: string;
  subtitle?: string;
  description?: string;
  type: EntertainmentType;
  provider?: string;
  price?: number;
  currency?: string;
  available?: boolean;
  location?: EntertainmentLocation;
  metadata?: EntertainmentMetadata;
}

export interface UpdateEntertainmentItemRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  type?: EntertainmentType;
  provider?: string;
  price?: number;
  currency?: string;
  available?: boolean;
  location?: EntertainmentLocation;
  metadata?: EntertainmentMetadata;
}

// API response types
export interface EntertainmentListResponse {
  data: EntertainmentItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface EntertainmentSingleResponse {
  data: EntertainmentItem;
}

export interface EntertainmentErrorResponse {
  error: string;
  details?: string;
}

export interface EntertainmentDeleteResponse {
  message: string;
}

// Query parameters for list endpoint
export interface EntertainmentQueryParams {
  q?: string; // Search query
  type?: EntertainmentType; // Filter by type
  available?: boolean; // Filter by availability
  limit?: number; // Max results (default 50, max 100)
  offset?: number; // Pagination offset (default 0)
}

// Filter options
export interface EntertainmentFilters {
  type?: EntertainmentType;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  country?: string;
  available?: boolean;
  minRating?: number;
}

// Sort options
export type EntertainmentSortField = 
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'price'
  | 'rating';

export type EntertainmentSortOrder = 'asc' | 'desc';

export interface EntertainmentSort {
  field: EntertainmentSortField;
  order: EntertainmentSortOrder;
}

// Type guards
export function isEntertainmentItem(obj: any): obj is EntertainmentItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.type === 'string'
  );
}

export function isValidEntertainmentType(type: string): type is EntertainmentType {
  const validTypes = ['tour', 'show', 'activity', 'attraction', 'concert', 'sport'];
  return validTypes.includes(type);
}

// Helper functions
export function validateCreateRequest(
  data: any
): data is CreateEntertainmentItemRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    typeof data.type === 'string' &&
    data.type.length > 0
  );
}

export function validateUpdateRequest(
  data: any
): data is UpdateEntertainmentItemRequest {
  return typeof data === 'object' && data !== null;
}

// Price formatting helper
export function formatPrice(price: number | null, currency: string = 'USD'): string {
  if (price === null) return 'Price on request';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

// Duration parsing helper
export function parseDuration(duration: string | undefined): number | null {
  if (!duration) return null;
  
  const hourMatch = duration.match(/(\d+)\s*hour/i);
  const minuteMatch = duration.match(/(\d+)\s*minute/i);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  
  return hours * 60 + minutes; // Return total minutes
}

// Rating display helper
export function formatRating(rating: number | undefined): string {
  if (!rating) return 'No rating';
  return `${rating.toFixed(1)} ⭐`;
}

// Export all types
export type {
  EntertainmentItem as EntertainmentItemType,
  EntertainmentLocation as LocationType,
  EntertainmentMetadata as MetadataType,
};
