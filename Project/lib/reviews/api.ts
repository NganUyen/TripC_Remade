import { api } from "@/lib/api"
import type { Review, CreateReviewRequest, ReviewsResponse, UpdateReviewRequest } from "./types"

export const reviewsApi = {
    getReviews: async (
        entityType: string,
        entityId: string,
        limit: number = 10,
        offset: number = 0
    ): Promise<ReviewsResponse> => {
        const queryParams = new URLSearchParams({
            entity_type: entityType,
            entity_id: entityId,
            limit: String(limit),
            offset: String(offset),
        })
        const response = await api.get(`/reviews?${queryParams.toString()}`)
        return response.data
    },

    createReview: async (
        data: CreateReviewRequest,
        options?: { headers?: Record<string, string> }
    ): Promise<Review> => {
        const response = await api.post(
            "/reviews",
            data,
            options?.headers ? { headers: options.headers } : undefined
        )
        return response.data
    },

    updateReview: async (
        id: string,
        data: UpdateReviewRequest
    ): Promise<Review> => {
        const response = await api.put(`/reviews/${id}`, data)
        return response.data
    },

    deleteReview: async (id: string): Promise<void> => {
        await api.delete(`/reviews/${id}`)
    },
}
