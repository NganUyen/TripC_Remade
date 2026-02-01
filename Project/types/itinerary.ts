/**
 * Itinerary Type Definitions
 */

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  description?: string;
  activities: ItineraryActivity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: {
    name: string;
    checkIn?: string;
    checkOut?: string;
    hotelId?: string;
  };
  transportation?: {
    type: string;
    from: string;
    to: string;
    time?: string;
    cost?: number;
  }[];
  notes?: string;
}

export interface ItineraryActivity {
  id: string;
  time?: string;
  title: string;
  description: string;
  location: string;
  duration?: string;
  cost?: number;
  category:
    | "sightseeing"
    | "dining"
    | "activity"
    | "shopping"
    | "transport"
    | "relaxation"
    | "other";
  bookingRequired?: boolean;
  bookingId?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  tips?: string[];
}

export interface ItineraryBudget {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface Itinerary {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  travelers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  travelStyle: string[];
  interests: string[];
  budget?: ItineraryBudget;
  days: ItineraryDay[];
  coverImage?: string;
  images?: string[];
  tips?: string[];
  essentials?: {
    visa?: string;
    weather?: string;
    currency?: string;
    language?: string;
    bestTimeToVisit?: string;
    packingList?: string[];
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isAIGenerated: boolean;
  likes?: number;
  saves?: number;
}

export interface ItineraryGenerationRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  budget?: {
    amount: number;
    currency: string;
    level: "budget" | "moderate" | "luxury";
  };
  interests: string[];
  travelStyle: string[];
  pace?: "relaxed" | "moderate" | "packed";
  accommodation?: {
    type: "hotel" | "hostel" | "apartment" | "resort" | "any";
    preferences?: string[];
  };
  meals?: {
    includeBreakfast?: boolean;
    includeLunch?: boolean;
    includeDinner?: boolean;
    dietaryRestrictions?: string[];
  };
  specialRequests?: string;
}

export interface ItineraryTemplate {
  id: string;
  name: string;
  destination: string;
  duration: number;
  description: string;
  thumbnail: string;
  highlights: string[];
  price?: number;
  difficulty?: "easy" | "moderate" | "challenging";
  bestFor: string[];
}
