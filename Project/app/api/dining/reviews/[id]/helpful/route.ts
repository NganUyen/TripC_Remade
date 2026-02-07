// API Route: PUT /api/dining/reviews/[id]/helpful - Mark review as helpful

import { NextRequest, NextResponse } from "next/server";
import { reviewService } from "@/lib/dining/services/reviewService";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const success = await reviewService.markReviewHelpful(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to mark review as helpful",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review marked as helpful",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/dining/reviews/[id]/helpful:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update review",
      },
      { status: 500 },
    );
  }
}
