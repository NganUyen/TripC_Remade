// Review service - handles dining review operations
// Modular service layer for Dining reviews

import { supabaseServerClient } from "../supabaseServerClient";

export interface DiningReview {
  id: string;
  venue_id: string;
  user_id: string;
  booking_id?: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  value_rating?: number;
  photos?: string[];
  visit_date?: string;
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  response_text?: string;
  response_date?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  venue_id: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  food_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  value_rating?: number;
  photos?: string[];
  visit_date?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  food_avg?: number;
  service_avg?: number;
  ambiance_avg?: number;
  value_avg?: number;
}

export class ReviewService {
  private supabase = supabaseServerClient;

  /**
   * Create a new review
   */
  async createReview(
    reviewData: CreateReviewRequest,
    userId: string,
  ): Promise<DiningReview | null> {
    try {
      // Check if user has already reviewed this venue
      const { data: existing } = await this.supabase
        .from("dining_reviews")
        .select("id")
        .eq("venue_id", reviewData.venue_id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        throw new Error("You have already reviewed this venue");
      }

      const { data, error } = await this.supabase
        .from("dining_reviews")
        .insert({
          ...reviewData,
          user_id: userId,
          status: "pending",
          is_verified: false,
          is_featured: false,
          helpful_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Update venue average rating
      await this.updateVenueRating(reviewData.venue_id);

      return data as DiningReview;
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  }

  /**
   * Get reviews for a venue
   */
  async getVenueReviews(
    venueId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<DiningReview[]> {
    const { data, error } = await this.supabase
      .from("dining_reviews")
      .select("*")
      .eq("venue_id", venueId)
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("helpful_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    return (data || []) as DiningReview[];
  }

  /**
   * Get review statistics for a venue
   */
  async getVenueReviewStats(venueId: string): Promise<ReviewStats | null> {
    const { data: reviews, error } = await this.supabase
      .from("dining_reviews")
      .select(
        "rating, food_rating, service_rating, ambiance_rating, value_rating",
      )
      .eq("venue_id", venueId)
      .eq("status", "approved");

    if (error || !reviews || reviews.length === 0) {
      return null;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    let foodSum = 0;
    let serviceSum = 0;
    let ambianceSum = 0;
    let valueSum = 0;
    let foodCount = 0;
    let serviceCount = 0;
    let ambianceCount = 0;
    let valueCount = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      distribution[review.rating as keyof typeof distribution]++;

      if (review.food_rating) {
        foodSum += review.food_rating;
        foodCount++;
      }
      if (review.service_rating) {
        serviceSum += review.service_rating;
        serviceCount++;
      }
      if (review.ambiance_rating) {
        ambianceSum += review.ambiance_rating;
        ambianceCount++;
      }
      if (review.value_rating) {
        valueSum += review.value_rating;
        valueCount++;
      }
    });

    return {
      average_rating: totalRating / reviews.length,
      total_reviews: reviews.length,
      rating_distribution: distribution,
      food_avg: foodCount > 0 ? foodSum / foodCount : undefined,
      service_avg: serviceCount > 0 ? serviceSum / serviceCount : undefined,
      ambiance_avg: ambianceCount > 0 ? ambianceSum / ambianceCount : undefined,
      value_avg: valueCount > 0 ? valueSum / valueCount : undefined,
    };
  }

  /**
   * Update venue's average rating
   */
  private async updateVenueRating(venueId: string): Promise<void> {
    const stats = await this.getVenueReviewStats(venueId);

    if (stats) {
      await this.supabase
        .from("dining_venues")
        .update({
          average_rating: stats.average_rating,
          review_count: stats.total_reviews,
        })
        .eq("id", venueId);
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<boolean> {
    // First get current helpful_count
    const { data: review, error: fetchError } = await this.supabase
      .from("dining_reviews")
      .select("helpful_count")
      .eq("id", reviewId)
      .single();

    if (fetchError || !review) return false;

    // Then increment it
    const { error } = await this.supabase
      .from("dining_reviews")
      .update({
        helpful_count: (review.helpful_count || 0) + 1,
      })
      .eq("id", reviewId);

    return !error;
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(
    userId: string,
    limit: number = 50,
  ): Promise<DiningReview[]> {
    const { data, error } = await this.supabase
      .from("dining_reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }

    return (data || []) as DiningReview[];
  }

  /**
   * Delete a review (user can only delete their own)
   */
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("dining_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (!error) {
      // Get the venue ID to update rating
      const { data: review } = await this.supabase
        .from("dining_reviews")
        .select("venue_id")
        .eq("id", reviewId)
        .single();

      if (review) {
        await this.updateVenueRating(review.venue_id);
      }
    }

    return !error;
  }
}

export const reviewService = new ReviewService();
