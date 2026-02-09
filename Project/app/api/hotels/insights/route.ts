/**
 * AI Hotel Insights API
 * Generates personalized recommendations, insights, and travel tips for hotels
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

interface Hotel {
  id: string;
  name: string;
  description?: string;
  star_rating: number;
  amenities?: string[];
  address?: {
    city?: string;
    country?: string;
  };
  best_price?: number;
}

interface InsightsRequest {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  travelPurpose?: "leisure" | "business" | "family" | "romantic" | "solo";
}

export async function POST(req: NextRequest) {
  try {
    const body: InsightsRequest = await req.json();
    const { hotel, checkIn, checkOut, guests = 2, travelPurpose = "leisure" } = body;

    if (!hotel || !hotel.name) {
      return NextResponse.json(
        { error: "Hotel information is required" },
        { status: 400 },
      );
    }

    // Prepare hotel summary for AI
    const hotelSummary = `
Hotel: ${hotel.name}
Location: ${hotel.address?.city || "Unknown"}, ${hotel.address?.country || "Vietnam"}
Star Rating: ${hotel.star_rating}/5
Price: $${hotel.best_price ? (hotel.best_price / 100).toFixed(0) : "N/A"}/night
Amenities: ${(hotel.amenities || []).slice(0, 10).join(", ")}
Description: ${hotel.description || "N/A"}
`;

    const travelContext = `
Check-in: ${checkIn || "Not specified"}
Check-out: ${checkOut || "Not specified"}
Guests: ${guests}
Travel Purpose: ${travelPurpose}
`;

    const prompt = `As an expert travel concierge, analyze this hotel and provide personalized insights for guests.

${hotelSummary}
${travelContext}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "title": "AI Insight: [Perfect For Category]",
  "mainInsight": "2-3 engaging sentences highlighting the best features and hidden gems of this hotel. Mention specific room types, experiences, or amenities by name. Include practical tips about timing or booking.",
  "perfectFor": ["Category 1", "Category 2", "Category 3"],
  "highlights": [
    "Specific feature or room type guests love",
    "Unique experience or amenity",
    "Pro tip about timing or location"
  ],
  "packingList": [
    "Item 1 (context/reason)",
    "Item 2 (context/reason)",
    "Item 3 (context/reason)",
    "Item 4 (context/reason)",
    "Item 5 (context/reason)"
  ],
  "bestTimeToVisit": "Brief suggestion about timing for pools, restaurants, etc.",
  "localTips": [
    "Local insight 1",
    "Local insight 2"
  ]
}

IMPORTANT:
- Be specific with room names, amenity names, and features
- Make it feel personal and insider knowledge
- Include practical, actionable advice
- Match the tone to the travel purpose
- Return raw JSON only, NO markdown formatting`;

    // Call Deepseek AI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content || "";
      console.log("[Hotel Insights] Raw AI response:", content.substring(0, 200) + "...");

      // Parse AI response
      let insights;
      try {
        // Remove markdown code blocks if present
        let jsonString = content.trim();
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1].trim();
          console.log("[Hotel Insights] Extracted from code block");
        }
        
        insights = JSON.parse(jsonString);
        console.log("[Hotel Insights] Successfully parsed for:", hotel.name);
      } catch (parseError) {
        console.error("Failed to parse AI insights:", parseError);
        console.error("Content that failed:", content);
        
        // Fallback response
        insights = {
          title: `AI Insight: Perfect for ${travelPurpose === "romantic" ? "Couples" : travelPurpose === "family" ? "Families" : "Travelers"}`,
          mainInsight: `${hotel.name} offers a ${hotel.star_rating}-star experience with excellent amenities and convenient location in ${hotel.address?.city || "the area"}. Guests particularly appreciate the attention to detail and quality service.`,
          perfectFor: [
            travelPurpose === "romantic" ? "Couples" : "Leisure travelers",
            "Weekend getaways",
            "Special occasions"
          ],
          highlights: [
            `${hotel.star_rating}-star amenities and service`,
            "Prime location for exploring the area",
            "Highly-rated guest experience"
          ],
          packingList: [
            "Comfortable walking shoes (exploring the area)",
            "Sunscreen & Hat (outdoor activities)",
            "Camera (capturing memories)",
            "Light jacket (air-conditioned interiors)"
          ],
          bestTimeToVisit: "Visit the pool and spa facilities during weekday mornings for the best experience.",
          localTips: [
            "Ask the concierge for local restaurant recommendations",
            "Book spa services in advance during peak season"
          ]
        };
      }

      return NextResponse.json({
        success: true,
        insights,
        timestamp: new Date().toISOString(),
      });
    } catch (aiError) {
      clearTimeout(timeoutId);
      if (aiError instanceof Error && aiError.name === 'AbortError') {
        return NextResponse.json(
          {
            error: "AI request timed out",
            details: "The AI analysis took too long. Please try again.",
          },
          { status: 504 },
        );
      }
      throw aiError;
    }

  } catch (error) {
    console.error("Hotel insights error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate hotel insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
