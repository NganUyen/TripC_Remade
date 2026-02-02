export interface Review {
    id: string
    user_id: string
    entity_id: string
    entity_type: string
    rating: number
    title?: string
    comment?: string
    photos?: string[]
    helpful_count: number
    is_verified: boolean
    status: 'published' | 'hidden' | 'archived'
    created_at: string
    updated_at: string

    // Join fields (optional, depending on query)
    user?: {
        first_name?: string
        last_name?: string
        full_name?: string
        avatar_url?: string
    }
}

export interface CreateReviewRequest {
    entity_id: string
    entity_type: string
    rating: number
    title?: string
    comment?: string
    photos?: string[]
}

export interface UpdateReviewRequest {
    rating?: number
    title?: string
    comment?: string
    photos?: string[]
    status?: 'published' | 'hidden' | 'archived'
}

export interface ReviewStats {
    average_rating: number
    total_reviews: number
    rating_distribution: {
        5: number
        4: number
        3: number
        2: number
        1: number
    }
}

export interface ReviewsResponse {
    reviews: Review[]
    stats: ReviewStats
    has_more: boolean
}
