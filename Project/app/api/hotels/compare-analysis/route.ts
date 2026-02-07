/**
 * AI-Powered Hotel Comparison Analysis
 * Generates intelligent recommendations using Deepseek AI
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Set maximum duration for this API route (60 seconds)
export const maxDuration = 60;

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

// Match actual database schema
interface Hotel {
  id: string; // UUID from database
  slug?: string;
  name: string;
  description?: string;
  address?: {
    city?: string;
    country?: string;
    street?: string;
  };
  star_rating: number; // 0-5 from database
  images?: Array<{ url: string; caption?: string }>;
  amenities?: string[];
  best_price?: number; // in cents from database
  // Calculated/derived fields
  reviews_count?: number;
  average_rating?: number;
  // From hotel_rooms
  room_size_sqm?: number;
}

interface ComparisonRequest {
  hotels: Hotel[];
  userPreferences?: {
    budget?: string;
    priorities?: string[];
    travelPurpose?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: ComparisonRequest = await req.json();
    const { hotels, userPreferences } = body;

    if (!hotels || hotels.length < 2) {
      return NextResponse.json(
        { error: "At least 2 hotels required for comparison" },
        { status: 400 },
      );
    }

    // Prepare hotel data for AI analysis (optimized)
    const hotelSummaries = hotels
      .map(
        (hotel, index) => {
          const location = hotel.address?.city || "Unknown";
          const pricePerNight = hotel.best_price
            ? `$${(hotel.best_price / 100).toFixed(0)}`
            : "N/A";
          return `Hotel ${index + 1}: ${hotel.name}
- Location: ${location}
- Price: ${pricePerNight}/night
- Star Rating: ${hotel.star_rating}/5
- Guest Rating: ${hotel.average_rating?.toFixed(1) || "N/A"}/10 (${hotel.reviews_count || 0} reviews)
- Amenities: ${(hotel.amenities || []).slice(0, 5).join(", ")}`;
        }
      )
      .join("\n\n");

    const userContext = userPreferences
      ? `
User Preferences:
- Budget: ${userPreferences.budget || "Not specified"}
- Priorities: ${userPreferences.priorities?.join(", ") || "Not specified"}
- Travel Purpose: ${userPreferences.travelPurpose || "Not specified"}
`
      : "";

    const prompt = `Compare these hotels as an expert travel advisor. Use data-driven analysis:

${hotelSummaries}
${userContext}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "verdict": "2-3 sentences identifying the best choice and why",
  "bestValue": "Hotel name + value explanation",
  "bestRated": "Hotel name + quality reasoning",
  "bestHotelName": "Exact name of the best hotel from the list",
  "bestFor": {
    "families": "Hotel name + family-friendly features",
    "business": "Hotel name + business amenities",
    "luxury": "Hotel name + luxury elements",
    "budget": "Hotel name + budget appeal"
  },
  "insights": ["Key advantage 1", "Key advantage 2", "Key advantage 3"],
  "warnings": ["Important consideration"],
  "recommendation": "Final recommendation (1-2 sentences)"
}

IMPORTANT: 
- Include EXACT hotel names from the list in bestHotelName field
- Return raw JSON only, NO markdown formatting
- Be concise, professional, and reference specific data points`;

    // Call Deepseek AI with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    try {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5, // Reduced from 0.7 for faster, more focused responses
        max_tokens: 600, // Reduced from 1000 for faster response
      });
      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content || "";
      console.log("[AI Response] Raw content:", content.substring(0, 200) + "...");

      // Parse AI response
      let analysis;
      try {
        // Try to extract JSON from markdown code blocks if present
        // Handle multiple formats: ```json, ```, or raw JSON
        let jsonString = content.trim();
        
        // Remove markdown code blocks if present
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1].trim();
          console.log("[AI Response] Extracted from code block");
        }
        
        analysis = JSON.parse(jsonString);
        console.log("[AI Response] Successfully parsed, best hotel:", analysis.bestHotelName || "Not specified");
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Content that failed to parse:", content);
        // Fallback response
        analysis = {
          verdict: content.substring(0, 300),
          bestValue: hotels[0].name,
          bestRated: hotels[0].name,
          bestHotelName: hotels[0].name,
          insights: ["AI analysis in progress..."],
          recommendation: "Please compare the options based on your preferences.",
        };
      }

      return NextResponse.json({
        success: true,
        analysis,
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
    console.error("AI comparison analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate comparison analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
