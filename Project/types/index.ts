// Global types and interfaces

export interface Trip {
  id: string
  title: string
  description: string
  destination: string
  startDate: Date
  endDate: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ActivityTicketType {
  name: string
  price: number
}

export interface ActivityFeatures {
  free_cancellation?: boolean
  mobile_ticket?: boolean
  instant_confirmation?: boolean
  skip_the_line?: boolean
  dinner_included?: boolean
  pickup_included?: boolean
  fixed_date?: boolean
  [key: string]: any
}

export interface Activity {
  id: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  reviews_count: number;
  price: number;
  old_price?: number;
  image_url: string;
  images?: string[];
  is_instant: boolean;
  features?: ActivityFeatures;
  ticket_types: ActivityTicketType[];
  category?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  important_info?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WellnessExperience {
  id: string; // UUID from Supabase
  title: string;
  location: string;
  rating: number;
  reviews_count: number;
  price: number;
  image_url: string;
  images?: string[];
  badge?: string | null;
  duration: string;
  description?: string;
  features?: { icon: string; title: string; description: string }[];
  reviews_data?: { name: string; date: string; rating: number; comment: string; image: string; type: string }[];
}

