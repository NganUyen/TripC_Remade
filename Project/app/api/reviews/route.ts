import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";
import type { CreateReviewRequest } from "@/lib/reviews/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const entityType = searchParams.get("entity_type");
        const entityId = searchParams.get("entity_id");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!entityType || !entityId) {
            return NextResponse.json(
                { success: false, error: "Missing entity_type or entity_id" },
                { status: 400 }
            );
        }

        // Get Reviews
        const { data: reviews, error } = await reviewsClient
            .from("reviews")
            .select("*")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId)
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Get Stats (Average Rating)
        // Note: This might be expensive for large tables. 
        // Optimization: Store stats in a separate table or aggregate periodically.
        // For now, calculating on fly or fetching from entity table if it has review_count/avg_rating.
        // Let's do a quick aggregation here if possible, or just return basic stats.

        // Simple fetch for all ratings to calculate average 
        // (This is not efficient for production but fine for MVP/Intern task)
        const { data: allRatings, error: statsError } = await reviewsClient
            .from("reviews")
            .select("rating")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId)
            .eq("status", "published");

        let stats = {
            average_rating: 0,
            total_reviews: 0,
            rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as any
        };

        if (!statsError && allRatings) {
            const total = allRatings.length;
            const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
            stats.total_reviews = total;
            stats.average_rating = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;

            allRatings.forEach(r => {
                if (stats.rating_distribution[r.rating] !== undefined) {
                    stats.rating_distribution[r.rating]++;
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                reviews: reviews || [],
                stats,
                has_more: (reviews?.length || 0) === limit
            }
        });

    } catch (error: any) {
        console.error("Error in GET /api/reviews:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateReviewRequest = await request.json();
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Missing x-user-id header" },
                { status: 401 }
            );
        }

        if (!body.entity_id || !body.entity_type || !body.rating) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data, error } = await reviewsClient
            .from("reviews")
            .insert({
                user_id: userId,
                entity_id: body.entity_id,
                entity_type: body.entity_type,
                rating: body.rating,
                title: body.title,
                comment: body.comment,
                photos: body.photos || [],
                status: 'published' // Auto-publish for now
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json(
                    { success: false, error: "You have already reviewed this item." },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("Error in POST /api/reviews:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
